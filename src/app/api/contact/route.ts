import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const PROJECT_TYPE_LABELS: Record<string, string> = {
  xr: 'XR/VR/AR Development',
  web: 'Web Development',
  game: 'Game Development',
  ai: 'AI/ML Integration',
  research: 'Research Project',
};

const BUDGET_LABELS: Record<string, string> = {
  'under-5k': 'Under €5K',
  '5k-15k': '€5K - €15K',
  '15k-50k': '€15K - €50K',
  '50k-plus': '€50K+',
  discuss: "Let's discuss",
};

const TIMELINE_LABELS: Record<string, string> = {
  asap: 'ASAP',
  '1-3-months': '1-3 months',
  '3-6-months': '3-6 months',
  '6-12-months': '6-12 months',
  'long-term': 'Long-term project',
};

const ContactFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z
    .string()
    .trim()
    .email('Please provide a valid email address')
    .max(320, 'Email address is too long'),
  subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().trim().min(1, 'Message is required').max(5000, 'Message is too long'),
  projectType: z
    .enum(['xr', 'web', 'game', 'ai', 'research'] as const)
    .optional(),
  budget: z
    .enum(['under-5k', '5k-15k', '15k-50k', '50k-plus', 'discuss'] as const)
    .optional(),
  timeline: z
    .enum(['asap', '1-3-months', '3-6-months', '6-12-months', 'long-term'] as const)
    .optional(),
});

type ContactFormPayload = z.infer<typeof ContactFormSchema>;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatMultiline = (value: string): string => escapeHtml(value).replace(/\r?\n/g, '<br />');

const getDisplayValue = (value: string | undefined, labels: Record<string, string>): string => {
  if (!value) {
    return 'Not specified';
  }

  return labels[value] ?? value;
};

const buildHtmlBody = (data: ContactFormPayload, submittedAt: string) => {
  return `
    <div style="font-family: 'Inter', Arial, sans-serif; background-color: #0b1120; padding: 24px;">
      <div style="max-width: 640px; margin: 0 auto; background-color: rgba(15, 23, 42, 0.85); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 16px; padding: 24px; color: #e2e8f0;">
        <h2 style="margin: 0 0 16px; font-size: 20px; color: #38bdf8;">New contact from sharifbayoumy.com</h2>
        <p style="margin: 0 0 24px; color: #cbd5f5;">You received a new message from your portfolio contact form.</p>
        <div style="display: grid; gap: 12px; margin-bottom: 24px;">
          <div><strong style="display: block; color: #94a3b8;">Name</strong><span style="color: #f8fafc;">${escapeHtml(
            data.name
          )}</span></div>
          <div><strong style="display: block; color: #94a3b8;">Email</strong><span style="color: #f8fafc;">${escapeHtml(
            data.email
          )}</span></div>
          <div><strong style="display: block; color: #94a3b8;">Subject</strong><span style="color: #f8fafc;">${escapeHtml(
            data.subject
          )}</span></div>
          <div><strong style="display: block; color: #94a3b8;">Project Type</strong><span style="color: #f8fafc;">${escapeHtml(
            getDisplayValue(data.projectType, PROJECT_TYPE_LABELS)
          )}</span></div>
          <div><strong style="display: block; color: #94a3b8;">Budget</strong><span style="color: #f8fafc;">${escapeHtml(
            getDisplayValue(data.budget, BUDGET_LABELS)
          )}</span></div>
          <div><strong style="display: block; color: #94a3b8;">Timeline</strong><span style="color: #f8fafc;">${escapeHtml(
            getDisplayValue(data.timeline, TIMELINE_LABELS)
          )}</span></div>
          <div><strong style="display: block; color: #94a3b8;">Submitted</strong><span style="color: #f8fafc;">${escapeHtml(
            submittedAt
          )}</span></div>
        </div>
        <div style="border-top: 1px solid rgba(148, 163, 184, 0.2); padding-top: 16px;">
          <strong style="display: block; margin-bottom: 8px; color: #94a3b8;">Message</strong>
          <p style="white-space: pre-wrap; margin: 0; color: #f8fafc; line-height: 1.8;">${formatMultiline(data.message)}</p>
        </div>
      </div>
    </div>
  `;
};

const buildTextBody = (data: ContactFormPayload, submittedAt: string) => {
  return [
    'New contact from sharifbayoumy.com',
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Subject: ${data.subject}`,
    `Project Type: ${getDisplayValue(data.projectType, PROJECT_TYPE_LABELS)}`,
    `Budget: ${getDisplayValue(data.budget, BUDGET_LABELS)}`,
    `Timeline: ${getDisplayValue(data.timeline, TIMELINE_LABELS)}`,
    `Submitted: ${submittedAt}`,
    '',
    'Message:',
    data.message,
  ].join('\n');
};

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = ContactFormSchema.safeParse(payload);

    if (!parsed.success) {
      const message =
        parsed.error.issues
          .map((issue: { message?: string }) => issue.message || 'Invalid field')
          .join(', ') || 'Invalid form submission.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error('RESEND_API_KEY is not configured.');
      return NextResponse.json({ error: 'Email service is not configured.' }, { status: 500 });
    }

    const contactEmail = process.env.CONTACT_EMAIL || 'hello@sharifbayoumy.com';
    const fromEmail = process.env.RESEND_FROM_EMAIL || `Sharif Bayoumy <${contactEmail}>`;
    const toEmail = process.env.RESEND_TO_EMAIL || contactEmail;
    const submittedAt = new Date().toUTCString();

    const emailPayload = {
      from: fromEmail,
      to: [toEmail],
      reply_to: parsed.data.email,
      subject: `New portfolio inquiry: ${parsed.data.subject}`,
      html: buildHtmlBody(parsed.data, submittedAt),
      text: buildTextBody(parsed.data, submittedAt),
      tags: [
        { name: 'source', value: 'portfolio-contact-form' },
        {
          name: 'environment',
          value: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
        },
      ],
    };

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!resendResponse.ok) {
      const errorPayload = await resendResponse.json().catch(() => null);
      const errorMessage =
        (errorPayload && (errorPayload.message || errorPayload.error || errorPayload?.details?.[0]?.message)) ||
        `Failed to send message (status ${resendResponse.status})`;

      console.error('Resend API error:', errorPayload || resendResponse.statusText);
      return NextResponse.json({ error: errorMessage }, { status: 502 });
    }

    return NextResponse.json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Contact form submission failed:', error);
    return NextResponse.json({ error: 'Unable to send message at this time.' }, { status: 500 });
  }
}
