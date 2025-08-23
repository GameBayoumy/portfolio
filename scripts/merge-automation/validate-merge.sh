#!/bin/bash

# Intelligent PR Auto-Merge Validation Script
# This script provides comprehensive validation for PR auto-merge readiness

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/../../config/merge-automation/merge-config.yml"
VALIDATION_REPORT_FILE="/tmp/merge-validation-report.json"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Initialize validation report
init_report() {
    cat > "$VALIDATION_REPORT_FILE" << EOF
{
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "pr_number": "$PR_NUMBER",
    "validations": {},
    "can_merge": false,
    "reasons": [],
    "warnings": []
}
EOF
}

# Add validation result to report
add_validation() {
    local name="$1"
    local passed="$2"
    local message="$3"
    local details="${4:-{}}"
    
    jq --arg name "$name" \
       --arg passed "$passed" \
       --arg message "$message" \
       --argjson details "$details" \
       '.validations[$name] = {
           "passed": ($passed == "true"),
           "message": $message,
           "details": $details
       }' "$VALIDATION_REPORT_FILE" > "/tmp/report_temp.json" \
    && mv "/tmp/report_temp.json" "$VALIDATION_REPORT_FILE"
}

# Add reason or warning to report
add_reason() {
    local reason="$1"
    jq --arg reason "$reason" '.reasons += [$reason]' "$VALIDATION_REPORT_FILE" > "/tmp/report_temp.json" \
    && mv "/tmp/report_temp.json" "$VALIDATION_REPORT_FILE"
}

add_warning() {
    local warning="$1"
    jq --arg warning "$warning" '.warnings += [$warning]' "$VALIDATION_REPORT_FILE" > "/tmp/report_temp.json" \
    && mv "/tmp/report_temp.json" "$VALIDATION_REPORT_FILE"
}

# Check if required tools are installed
check_dependencies() {
    local missing_tools=()
    
    for tool in gh jq curl; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_info "Please install the missing tools and try again"
        exit 1
    fi
    
    log_success "All required tools are available"
}

# Validate GitHub CLI authentication
validate_gh_auth() {
    log_info "Validating GitHub CLI authentication..."
    
    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI is not authenticated"
        log_info "Please run 'gh auth login' to authenticate"
        add_validation "gh_auth" "false" "GitHub CLI not authenticated"
        add_reason "GitHub CLI authentication required"
        return 1
    fi
    
    log_success "GitHub CLI is authenticated"
    add_validation "gh_auth" "true" "GitHub CLI authenticated"
    return 0
}

# Get PR information
get_pr_info() {
    log_info "Fetching PR information for #$PR_NUMBER..."
    
    if ! PR_DATA=$(gh pr view "$PR_NUMBER" --json number,title,body,state,mergeable,labels,reviews,statusCheckRollupState,headRefName,baseRefName,author,isDraft,additions,deletions,changedFiles,reviewDecision,mergeStateStatus 2>/dev/null); then
        log_error "Failed to fetch PR data"
        add_validation "pr_data" "false" "Failed to fetch PR data"
        add_reason "Unable to fetch PR information"
        return 1
    fi
    
    # Store PR data in environment for other functions
    export PR_DATA
    
    local pr_title=$(echo "$PR_DATA" | jq -r '.title')
    local pr_state=$(echo "$PR_DATA" | jq -r '.state')
    local pr_author=$(echo "$PR_DATA" | jq -r '.author.login')
    
    log_success "PR information retrieved: '$pr_title' by $pr_author (State: $pr_state)"
    add_validation "pr_data" "true" "PR data successfully retrieved"
    return 0
}

# Check auto-merge label
validate_auto_merge_label() {
    log_info "Checking for auto-merge label..."
    
    local has_auto_merge_label
    has_auto_merge_label=$(echo "$PR_DATA" | jq -r '
        .labels | map(select(.name | ascii_downcase | test("auto-merge|ready-to-merge|merge-when-ready"))) | length > 0
    ')
    
    if [ "$has_auto_merge_label" = "true" ]; then
        log_success "Auto-merge label found"
        add_validation "auto_merge_label" "true" "Auto-merge label present"
        return 0
    else
        log_error "Auto-merge label not found"
        add_validation "auto_merge_label" "false" "No auto-merge label present"
        add_reason "Missing auto-merge label"
        return 1
    fi
}

# Check for blocking labels
validate_blocking_labels() {
    log_info "Checking for blocking labels..."
    
    local blocking_labels
    blocking_labels=$(echo "$PR_DATA" | jq -r '
        .labels | map(select(.name | ascii_downcase | test("do-not-merge|wip|draft|hold|needs-work"))) | 
        if length > 0 then map(.name) | join(", ") else "none" end
    ')
    
    if [ "$blocking_labels" = "none" ]; then
        log_success "No blocking labels found"
        add_validation "blocking_labels" "true" "No blocking labels present"
        return 0
    else
        log_error "Blocking labels found: $blocking_labels"
        add_validation "blocking_labels" "false" "Blocking labels present: $blocking_labels"
        add_reason "Blocking labels present: $blocking_labels"
        return 1
    fi
}

# Check PR state and draft status
validate_pr_state() {
    log_info "Validating PR state..."
    
    local pr_state=$(echo "$PR_DATA" | jq -r '.state')
    local is_draft=$(echo "$PR_DATA" | jq -r '.isDraft')
    
    local state_valid=true
    
    if [ "$pr_state" != "OPEN" ]; then
        log_error "PR is not open (state: $pr_state)"
        add_validation "pr_state" "false" "PR state is $pr_state, expected OPEN"
        add_reason "PR is not open"
        state_valid=false
    else
        log_success "PR is open"
        add_validation "pr_state" "true" "PR is open"
    fi
    
    if [ "$is_draft" = "true" ]; then
        log_error "PR is in draft state"
        add_validation "draft_status" "false" "PR is in draft state"
        add_reason "PR is in draft state"
        state_valid=false
    else
        log_success "PR is not a draft"
        add_validation "draft_status" "true" "PR is not a draft"
    fi
    
    [ "$state_valid" = true ]
}

# Check mergeability
validate_mergeability() {
    log_info "Checking PR mergeability..."
    
    local mergeable=$(echo "$PR_DATA" | jq -r '.mergeable // "UNKNOWN"')
    
    case "$mergeable" in
        "MERGEABLE")
            log_success "PR is mergeable"
            add_validation "mergeable" "true" "PR is mergeable"
            return 0
            ;;
        "CONFLICTING")
            log_error "PR has merge conflicts"
            add_validation "mergeable" "false" "PR has merge conflicts"
            add_reason "PR has merge conflicts"
            return 1
            ;;
        "UNKNOWN")
            log_warning "Mergeability status is unknown"
            add_validation "mergeable" "false" "Mergeability status unknown"
            add_warning "Mergeability status is unknown"
            return 1
            ;;
        *)
            log_error "Unexpected mergeability status: $mergeable"
            add_validation "mergeable" "false" "Unexpected mergeability status: $mergeable"
            add_reason "Unexpected mergeability status"
            return 1
            ;;
    esac
}

# Check status checks
validate_status_checks() {
    log_info "Validating status checks..."
    
    local status_check_state=$(echo "$PR_DATA" | jq -r '.statusCheckRollupState // "PENDING"')
    
    case "$status_check_state" in
        "SUCCESS")
            log_success "All status checks passed"
            add_validation "status_checks" "true" "All status checks passed"
            return 0
            ;;
        "PENDING")
            log_warning "Status checks are pending"
            add_validation "status_checks" "false" "Status checks are pending"
            add_reason "Status checks are pending"
            return 1
            ;;
        "FAILURE"|"ERROR")
            log_error "Status checks failed: $status_check_state"
            add_validation "status_checks" "false" "Status checks failed: $status_check_state"
            add_reason "Status checks failed"
            return 1
            ;;
        *)
            log_warning "Unknown status check state: $status_check_state"
            add_validation "status_checks" "false" "Unknown status check state: $status_check_state"
            add_reason "Unknown status check state"
            return 1
            ;;
    esac
}

# Check required reviews
validate_reviews() {
    log_info "Validating required reviews..."
    
    local review_decision=$(echo "$PR_DATA" | jq -r '.reviewDecision // "REVIEW_REQUIRED"')
    
    case "$review_decision" in
        "APPROVED")
            log_success "Required reviews approved"
            add_validation "reviews" "true" "Required reviews approved"
            return 0
            ;;
        "REVIEW_REQUIRED")
            log_error "Reviews required but not provided"
            add_validation "reviews" "false" "Reviews required but not provided"
            add_reason "Required reviews missing"
            return 1
            ;;
        "CHANGES_REQUESTED")
            log_error "Changes requested in reviews"
            add_validation "reviews" "false" "Changes requested in reviews"
            add_reason "Changes requested in reviews"
            return 1
            ;;
        *)
            log_warning "Unknown review decision: $review_decision"
            add_validation "reviews" "false" "Unknown review decision: $review_decision"
            add_reason "Unknown review decision"
            return 1
            ;;
    esac
}

# Check branch protection rules
validate_branch_protection() {
    log_info "Validating branch protection rules..."
    
    local base_branch=$(echo "$PR_DATA" | jq -r '.baseRefName')
    
    if ! protection_data=$(gh api "/repos/:owner/:repo/branches/$base_branch/protection" 2>/dev/null); then
        log_warning "Could not fetch branch protection rules"
        add_validation "branch_protection" "true" "Branch protection validation skipped"
        add_warning "Could not validate branch protection rules"
        return 0
    fi
    
    # Check various protection rules
    local requires_status_checks=$(echo "$protection_data" | jq -r '.required_status_checks != null')
    local requires_reviews=$(echo "$protection_data" | jq -r '.required_pull_request_reviews != null')
    local enforces_admins=$(echo "$protection_data" | jq -r '.enforce_admins.enabled // false')
    
    local protection_details=$(jq -n \
        --arg status_checks "$requires_status_checks" \
        --arg reviews "$requires_reviews" \
        --arg enforce_admins "$enforces_admins" \
        '{
            "requires_status_checks": ($status_checks == "true"),
            "requires_reviews": ($reviews == "true"),
            "enforces_admins": ($enforce_admins == "true")
        }')
    
    log_success "Branch protection rules validated"
    add_validation "branch_protection" "true" "Branch protection rules validated" "$protection_details"
    return 0
}

# Check PR size
validate_pr_size() {
    log_info "Checking PR size..."
    
    local additions=$(echo "$PR_DATA" | jq -r '.additions')
    local deletions=$(echo "$PR_DATA" | jq -r '.deletions')
    local changed_files=$(echo "$PR_DATA" | jq -r '.changedFiles')
    local total_changes=$((additions + deletions))
    
    local size_details=$(jq -n \
        --arg additions "$additions" \
        --arg deletions "$deletions" \
        --arg changed_files "$changed_files" \
        --arg total_changes "$total_changes" \
        '{
            "additions": ($additions | tonumber),
            "deletions": ($deletions | tonumber),
            "changed_files": ($changed_files | tonumber),
            "total_changes": ($total_changes | tonumber)
        }')
    
    if [ "$total_changes" -gt 1000 ]; then
        log_warning "Large PR detected: $total_changes lines changed across $changed_files files"
        add_validation "pr_size" "true" "Large PR: $total_changes lines changed" "$size_details"
        add_warning "Large PR: $total_changes lines changed"
    elif [ "$total_changes" -gt 500 ]; then
        log_warning "Medium-sized PR: $total_changes lines changed across $changed_files files"
        add_validation "pr_size" "true" "Medium PR: $total_changes lines changed" "$size_details"
        add_warning "Medium PR: $total_changes lines changed"
    else
        log_success "PR size is reasonable: $total_changes lines changed across $changed_files files"
        add_validation "pr_size" "true" "PR size is reasonable: $total_changes lines changed" "$size_details"
    fi
    
    return 0
}

# Check deployment status
validate_deployment() {
    log_info "Checking deployment status..."
    
    local head_ref=$(echo "$PR_DATA" | jq -r '.headRefName')
    
    if ! deployments_data=$(gh api "/repos/:owner/:repo/deployments?ref=$head_ref&per_page=10" 2>/dev/null); then
        log_info "No deployment data available"
        add_validation "deployment" "true" "No deployment validation required"
        return 0
    fi
    
    local preview_deployments=$(echo "$deployments_data" | jq '[.[] | select(.environment == "preview" or .environment == "staging")]')
    local deployment_count=$(echo "$preview_deployments" | jq 'length')
    
    if [ "$deployment_count" -eq 0 ]; then
        log_info "No preview deployments found"
        add_validation "deployment" "true" "No preview deployments required"
        return 0
    fi
    
    local latest_deployment_id=$(echo "$preview_deployments" | jq -r '.[0].id')
    
    if ! deployment_status=$(gh api "/repos/:owner/:repo/deployments/$latest_deployment_id/statuses" 2>/dev/null); then
        log_warning "Could not fetch deployment status"
        add_validation "deployment" "true" "Deployment status check skipped"
        add_warning "Could not validate deployment status"
        return 0
    fi
    
    local latest_status=$(echo "$deployment_status" | jq -r '.[0].state')
    local target_url=$(echo "$deployment_status" | jq -r '.[0].target_url // "N/A"')
    
    case "$latest_status" in
        "success")
            log_success "Deployment preview successful"
            add_validation "deployment" "true" "Deployment preview successful"
            return 0
            ;;
        "pending"|"queued"|"in_progress")
            log_warning "Deployment preview is $latest_status"
            add_validation "deployment" "false" "Deployment preview is $latest_status"
            add_warning "Deployment preview is $latest_status"
            return 1
            ;;
        "error"|"failure")
            log_error "Deployment preview failed: $latest_status"
            add_validation "deployment" "false" "Deployment preview failed: $latest_status"
            add_reason "Deployment preview failed"
            return 1
            ;;
        *)
            log_warning "Unknown deployment status: $latest_status"
            add_validation "deployment" "true" "Deployment validation skipped"
            add_warning "Unknown deployment status"
            return 0
            ;;
    esac
}

# Generate final validation result
finalize_validation() {
    log_info "Finalizing validation results..."
    
    local all_passed=$(jq -r '.validations | to_entries | map(.value.passed) | all' "$VALIDATION_REPORT_FILE")
    local reason_count=$(jq -r '.reasons | length' "$VALIDATION_REPORT_FILE")
    
    local can_merge="false"
    if [ "$all_passed" = "true" ] && [ "$reason_count" -eq 0 ]; then
        can_merge="true"
    fi
    
    jq --arg can_merge "$can_merge" '.can_merge = ($can_merge == "true")' "$VALIDATION_REPORT_FILE" > "/tmp/report_temp.json" \
    && mv "/tmp/report_temp.json" "$VALIDATION_REPORT_FILE"
    
    if [ "$can_merge" = "true" ]; then
        log_success "✅ PR is ready for auto-merge!"
    else
        log_error "❌ PR is not ready for auto-merge"
        
        local reasons=$(jq -r '.reasons[]?' "$VALIDATION_REPORT_FILE")
        if [ -n "$reasons" ]; then
            log_error "Blocking reasons:"
            echo "$reasons" | while read -r reason; do
                log_error "  - $reason"
            done
        fi
        
        local warnings=$(jq -r '.warnings[]?' "$VALIDATION_REPORT_FILE")
        if [ -n "$warnings" ]; then
            log_warning "Warnings:"
            echo "$warnings" | while read -r warning; do
                log_warning "  - $warning"
            done
        fi
    fi
}

# Print validation summary
print_summary() {
    log_info "=== Validation Summary ==="
    
    local timestamp=$(jq -r '.timestamp' "$VALIDATION_REPORT_FILE")
    local can_merge=$(jq -r '.can_merge' "$VALIDATION_REPORT_FILE")
    
    echo "Timestamp: $timestamp"
    echo "PR Number: $PR_NUMBER"
    echo "Can Merge: $can_merge"
    echo
    
    log_info "Validation Details:"
    jq -r '.validations | to_entries[] | "  \(.key): \(if .value.passed then "✅" else "❌" end) \(.value.message)"' "$VALIDATION_REPORT_FILE"
    
    echo
    cat "$VALIDATION_REPORT_FILE"
}

# Main execution
main() {
    log_info "🤖 Starting PR Auto-Merge Validation"
    log_info "PR Number: ${PR_NUMBER:-not set}"
    
    if [ -z "$PR_NUMBER" ]; then
        log_error "PR_NUMBER environment variable is required"
        exit 1
    fi
    
    # Initialize
    init_report
    check_dependencies
    
    # Run validations
    validate_gh_auth || exit 1
    get_pr_info || exit 1
    
    # Core validations
    validate_auto_merge_label
    validate_blocking_labels
    validate_pr_state
    validate_mergeability
    validate_status_checks
    validate_reviews
    validate_branch_protection
    validate_pr_size
    validate_deployment
    
    # Finalize and report
    finalize_validation
    print_summary
    
    # Exit with appropriate code
    local can_merge=$(jq -r '.can_merge' "$VALIDATION_REPORT_FILE")
    if [ "$can_merge" = "true" ]; then
        log_success "🚀 Validation completed successfully - ready for merge!"
        exit 0
    else
        log_error "🛑 Validation failed - cannot proceed with merge"
        exit 1
    fi
}

# Execute main function
main "$@"