#!/bin/bash

# Intelligent PR Auto-Merge Execution Script
# This script handles the actual merging of PRs with comprehensive error handling

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
MERGE_REPORT_FILE="/tmp/merge-execution-report.json"

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

# Initialize merge report
init_report() {
    cat > "$MERGE_REPORT_FILE" << EOF
{
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "pr_number": "$PR_NUMBER",
    "merge_strategy": "$MERGE_STRATEGY",
    "execution_steps": [],
    "success": false,
    "merge_commit_sha": null,
    "error": null,
    "cleanup_completed": false
}
EOF
}

# Add execution step to report
add_step() {
    local step_name="$1"
    local status="$2"
    local message="$3"
    local details="${4:-{}}"
    
    local step_data=$(jq -n \
        --arg name "$step_name" \
        --arg status "$status" \
        --arg message "$message" \
        --argjson details "$details" \
        --arg timestamp "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
        '{
            "name": $name,
            "status": $status,
            "message": $message,
            "timestamp": $timestamp,
            "details": $details
        }')
    
    jq --argjson step "$step_data" '.execution_steps += [$step]' "$MERGE_REPORT_FILE" > "/tmp/report_temp.json" \
    && mv "/tmp/report_temp.json" "$MERGE_REPORT_FILE"
}

# Set final result
set_result() {
    local success="$1"
    local error_message="$2"
    local merge_sha="$3"
    
    jq --arg success "$success" \
       --arg error "$error_message" \
       --arg sha "$merge_sha" \
       '.success = ($success == "true") | 
        .error = (if $error == "" then null else $error end) |
        .merge_commit_sha = (if $sha == "" then null else $sha end)' \
       "$MERGE_REPORT_FILE" > "/tmp/report_temp.json" \
    && mv "/tmp/report_temp.json" "$MERGE_REPORT_FILE"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check required environment variables
    if [ -z "$PR_NUMBER" ]; then
        log_error "PR_NUMBER environment variable is required"
        add_step "check_prerequisites" "failed" "Missing PR_NUMBER environment variable"
        exit 1
    fi
    
    if [ -z "$MERGE_STRATEGY" ]; then
        MERGE_STRATEGY="merge"
        log_warning "MERGE_STRATEGY not set, defaulting to 'merge'"
    fi
    
    # Check required tools
    for tool in gh jq curl; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool not found: $tool"
            add_step "check_prerequisites" "failed" "Missing required tool: $tool"
            exit 1
        fi
    done
    
    # Check GitHub CLI authentication
    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI is not authenticated"
        add_step "check_prerequisites" "failed" "GitHub CLI not authenticated"
        exit 1
    fi
    
    log_success "Prerequisites check completed"
    add_step "check_prerequisites" "completed" "All prerequisites satisfied"
}

# Get PR information
get_pr_info() {
    log_info "Fetching PR information..."
    
    if ! PR_DATA=$(gh pr view "$PR_NUMBER" --json number,title,body,state,mergeable,headRefName,baseRefName,author,labels,mergeStateStatus 2>/dev/null); then
        log_error "Failed to fetch PR data"
        add_step "get_pr_info" "failed" "Failed to fetch PR data from GitHub"
        return 1
    fi
    
    export PR_DATA
    
    local pr_title=$(echo "$PR_DATA" | jq -r '.title')
    local pr_state=$(echo "$PR_DATA" | jq -r '.state')
    local pr_author=$(echo "$PR_DATA" | jq -r '.author.login')
    local head_ref=$(echo "$PR_DATA" | jq -r '.headRefName')
    local base_ref=$(echo "$PR_DATA" | jq -r '.baseRefName')
    
    local pr_info=$(jq -n \
        --arg title "$pr_title" \
        --arg state "$pr_state" \
        --arg author "$pr_author" \
        --arg head_ref "$head_ref" \
        --arg base_ref "$base_ref" \
        '{
            "title": $title,
            "state": $state,
            "author": $author,
            "head_ref": $head_ref,
            "base_ref": $base_ref
        }')
    
    log_success "PR information retrieved: '$pr_title' by $pr_author ($head_ref → $base_ref)"
    add_step "get_pr_info" "completed" "Successfully fetched PR information" "$pr_info"
    return 0
}

# Final validation before merge
final_validation() {
    log_info "Performing final validation before merge..."
    
    local pr_state=$(echo "$PR_DATA" | jq -r '.state')
    local mergeable=$(echo "$PR_DATA" | jq -r '.mergeable')
    local merge_state=$(echo "$PR_DATA" | jq -r '.mergeStateStatus // "UNKNOWN"')
    
    local validation_details=$(jq -n \
        --arg state "$pr_state" \
        --arg mergeable "$mergeable" \
        --arg merge_state "$merge_state" \
        '{
            "state": $state,
            "mergeable": $mergeable,
            "merge_state": $merge_state
        }')
    
    # Check if PR is still open
    if [ "$pr_state" != "OPEN" ]; then
        log_error "PR is no longer open (state: $pr_state)"
        add_step "final_validation" "failed" "PR state changed to $pr_state" "$validation_details"
        return 1
    fi
    
    # Check mergeability
    if [ "$mergeable" = "CONFLICTING" ]; then
        log_error "PR has merge conflicts"
        add_step "final_validation" "failed" "PR has merge conflicts" "$validation_details"
        return 1
    fi
    
    # Additional merge state validation
    case "$merge_state" in
        "BEHIND"|"DIRTY"|"DRAFT"|"BLOCKED")
            log_error "PR merge state prevents merging: $merge_state"
            add_step "final_validation" "failed" "Invalid merge state: $merge_state" "$validation_details"
            return 1
            ;;
        "CLEAN"|"UNSTABLE"|"UNKNOWN")
            log_info "PR merge state allows merging: $merge_state"
            ;;
        *)
            log_warning "Unexpected merge state: $merge_state, proceeding with caution"
            ;;
    esac
    
    log_success "Final validation passed"
    add_step "final_validation" "completed" "All final validations passed" "$validation_details"
    return 0
}

# Create merge commit message
create_commit_message() {
    log_info "Creating merge commit message..."
    
    local pr_title=$(echo "$PR_DATA" | jq -r '.title')
    local pr_body=$(echo "$PR_DATA" | jq -r '.body // ""')
    local pr_author=$(echo "$PR_DATA" | jq -r '.author.login')
    
    # Ensure PR number is in title
    if [[ ! "$pr_title" =~ \#$PR_NUMBER ]]; then
        pr_title="$pr_title (#$PR_NUMBER)"
    fi
    
    # Create commit body
    local commit_body=""
    if [ -n "$pr_body" ] && [ "$pr_body" != "null" ]; then
        commit_body="$pr_body"$'\n\n'
    fi
    
    # Add merge metadata
    commit_body+="Authored-by: $pr_author"$'\n'
    commit_body+="Merged-by: GitHub Actions Auto-Merge System"$'\n'
    commit_body+="Merge-strategy: $MERGE_STRATEGY"$'\n'
    commit_body+="Merge-timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    
    export COMMIT_TITLE="$pr_title"
    export COMMIT_BODY="$commit_body"
    
    log_success "Commit message created"
    add_step "create_commit_message" "completed" "Merge commit message prepared"
}

# Execute the merge
execute_merge() {
    log_info "Executing merge with strategy: $MERGE_STRATEGY..."
    
    local merge_command=""
    local merge_output=""
    local merge_result=0
    
    # Construct merge command based on strategy
    case "$MERGE_STRATEGY" in
        "squash")
            merge_command="gh pr merge $PR_NUMBER --squash --subject \"$COMMIT_TITLE\" --body \"$COMMIT_BODY\""
            ;;
        "rebase")
            merge_command="gh pr merge $PR_NUMBER --rebase"
            ;;
        "merge"|*)
            merge_command="gh pr merge $PR_NUMBER --merge --subject \"$COMMIT_TITLE\" --body \"$COMMIT_BODY\""
            ;;
    esac
    
    log_info "Merge command: $merge_command"
    
    # Execute merge with error handling
    if merge_output=$(eval "$merge_command" 2>&1); then
        log_success "Merge executed successfully"
        log_info "Merge output: $merge_output"
        
        # Extract merge commit SHA if possible
        local merge_sha=""
        if [[ "$merge_output" =~ ([a-f0-9]{40}) ]]; then
            merge_sha="${BASH_REMATCH[1]}"
            log_info "Merge commit SHA: $merge_sha"
        fi
        
        local merge_details=$(jq -n \
            --arg command "$merge_command" \
            --arg output "$merge_output" \
            --arg sha "$merge_sha" \
            '{
                "command": $command,
                "output": $output,
                "merge_sha": $sha
            }')
        
        add_step "execute_merge" "completed" "Merge executed successfully" "$merge_details"
        set_result "true" "" "$merge_sha"
        return 0
    else
        merge_result=$?
        log_error "Merge failed with exit code: $merge_result"
        log_error "Merge output: $merge_output"
        
        local error_details=$(jq -n \
            --arg command "$merge_command" \
            --arg output "$merge_output" \
            --arg exit_code "$merge_result" \
            '{
                "command": $command,
                "output": $output,
                "exit_code": ($exit_code | tonumber)
            }')
        
        add_step "execute_merge" "failed" "Merge execution failed: $merge_output" "$error_details"
        set_result "false" "$merge_output" ""
        return 1
    fi
}

# Post-merge cleanup
post_merge_cleanup() {
    log_info "Performing post-merge cleanup..."
    
    local cleanup_success=true
    local cleanup_details={}
    
    # Remove auto-merge labels
    local labels_to_remove=("auto-merge" "ready-to-merge" "merge-when-ready")
    local removed_labels=()
    
    for label in "${labels_to_remove[@]}"; do
        if gh pr edit "$PR_NUMBER" --remove-label "$label" 2>/dev/null; then
            log_info "Removed label: $label"
            removed_labels+=("$label")
        else
            log_warning "Failed to remove label: $label (may not exist)"
        fi
    done
    
    # Add merged label
    if gh pr edit "$PR_NUMBER" --add-label "merged" 2>/dev/null; then
        log_info "Added 'merged' label"
    else
        log_warning "Failed to add 'merged' label"
        cleanup_success=false
    fi
    
    # Update cleanup status
    cleanup_details=$(jq -n \
        --argjson removed_labels "$(printf '%s\n' "${removed_labels[@]}" | jq -R . | jq -s .)" \
        --arg success "$cleanup_success" \
        '{
            "removed_labels": $removed_labels,
            "added_merged_label": true,
            "success": ($success == "true")
        }')
    
    jq --argjson cleanup_completed "$cleanup_success" \
       '.cleanup_completed = $cleanup_completed' \
       "$MERGE_REPORT_FILE" > "/tmp/report_temp.json" \
    && mv "/tmp/report_temp.json" "$MERGE_REPORT_FILE"
    
    if [ "$cleanup_success" = true ]; then
        log_success "Post-merge cleanup completed"
        add_step "post_merge_cleanup" "completed" "Post-merge cleanup successful" "$cleanup_details"
    else
        log_warning "Post-merge cleanup had issues"
        add_step "post_merge_cleanup" "partial" "Post-merge cleanup partially successful" "$cleanup_details"
    fi
}

# Handle merge failure
handle_failure() {
    local error_message="$1"
    
    log_error "🚨 Handling merge failure: $error_message"
    
    # Remove auto-merge label to prevent retry loops
    if gh pr edit "$PR_NUMBER" --remove-label "auto-merge" 2>/dev/null; then
        log_info "Removed auto-merge label to prevent retry loops"
    fi
    
    # Add failure label
    if gh pr edit "$PR_NUMBER" --add-label "auto-merge-failed" 2>/dev/null; then
        log_info "Added auto-merge-failed label"
    fi
    
    local failure_details=$(jq -n \
        --arg error "$error_message" \
        --arg timestamp "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
        '{
            "error": $error,
            "timestamp": $timestamp,
            "recovery_actions": [
                "Auto-merge label removed",
                "Failure label added",
                "Manual intervention required"
            ]
        }')
    
    add_step "handle_failure" "completed" "Failure handling completed" "$failure_details"
}

# Print execution summary
print_summary() {
    log_info "=== Merge Execution Summary ==="
    
    local timestamp=$(jq -r '.timestamp' "$MERGE_REPORT_FILE")
    local success=$(jq -r '.success' "$MERGE_REPORT_FILE")
    local merge_sha=$(jq -r '.merge_commit_sha // "N/A"' "$MERGE_REPORT_FILE")
    local error=$(jq -r '.error // "None"' "$MERGE_REPORT_FILE")
    
    echo "Timestamp: $timestamp"
    echo "PR Number: $PR_NUMBER"
    echo "Merge Strategy: $MERGE_STRATEGY"
    echo "Success: $success"
    echo "Merge Commit SHA: $merge_sha"
    echo "Error: $error"
    echo
    
    log_info "Execution Steps:"
    jq -r '.execution_steps[] | "  \(.name): \(.status) - \(.message)"' "$MERGE_REPORT_FILE"
    
    echo
    echo "Full report:"
    cat "$MERGE_REPORT_FILE"
}

# Main execution
main() {
    log_info "🚀 Starting PR Auto-Merge Execution"
    log_info "PR Number: ${PR_NUMBER:-not set}"
    log_info "Merge Strategy: ${MERGE_STRATEGY:-merge}"
    
    # Initialize
    init_report
    
    # Execute merge process
    if check_prerequisites && \
       get_pr_info && \
       final_validation && \
       create_commit_message && \
       execute_merge; then
        
        # Success path
        post_merge_cleanup
        print_summary
        log_success "🎉 PR merged successfully!"
        exit 0
    else
        # Failure path
        local error_msg="Merge execution failed at one of the validation or execution steps"
        handle_failure "$error_msg"
        print_summary
        log_error "💥 Merge execution failed!"
        exit 1
    fi
}

# Trap to handle unexpected errors
trap 'handle_failure "Unexpected error occurred"; print_summary; exit 1' ERR

# Execute main function
main "$@"