import { Resend } from "resend";
import settings from "@/constants/settings";

// ── Environment Validation ─────────────────────────────────────────────────────
// Fail fast at startup — don't let a missing key cause silent runtime failures
if (!process.env.RESEND_API_KEY) {
  throw new Error("[EmailService] RESEND_API_KEY environment variable is not set.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Constants ──────────────────────────────────────────────────────────────────
const BRAND_COLOR = "#2d8a1a";
const FROM_ADDRESS = `TreeKart <${settings.EMAIL}>`;
const BASE_URL = "https://treekart.in";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ── Utilities ──────────────────────────────────────────────────────────────────

/**
 * Escapes HTML special characters to prevent XSS when injecting
 * user-controlled data into HTML email templates.
 */
function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Returns the first 8 chars of an orderId in uppercase.
 * Centralised so format changes are made in one place.
 */
function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

/**
 * Validates that required string fields are non-empty.
 * Throws a descriptive error so the caller knows exactly what's wrong.
 */
function validateFields(fields: Record<string, string | number>): void {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || String(value).trim() === "") {
      throw new Error(`[EmailService] Validation failed: "${key}" is required and cannot be empty.`);
    }
  }
}

// ── Core Sender ────────────────────────────────────────────────────────────────

/**
 * Internal helper that wraps resend.emails.send with:
 *  - Structured error handling (never throws uncontrolled errors to callers)
 *  - Consistent logging
 *  - Returns a typed EmailResult instead of raw SDK types
 */
async function sendEmail({
  to,
  subject,
  html,
  context,
}: {
  to: string;
  subject: string;
  html: string;
  context: string; // used in logs to identify which email type failed
}): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });

    if (error) {
      // Resend SDK returns errors as objects, not thrown exceptions
      console.error(`[EmailService] [${context}] Resend API error for <${to}>:`, error);
      return { success: false, error: error.message };
    }

    console.log(`[EmailService] [${context}] Sent successfully to <${to}> — messageId: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    // Network failures, timeouts, unexpected SDK errors
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[EmailService] [${context}] Unexpected error for <${to}>:`, message);
    return { success: false, error: message };
  }
}

// ── Shared Layout ──────────────────────────────────────────────────────────────

function emailLayout(content: string, previewText: string): string {
  const year = new Date().getFullYear();
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TreeKart</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a3a08; margin: 0; padding: 0; background-color: #fffef7; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: ${BRAND_COLOR}; text-decoration: none; }
          .card { background: white; border: 1px solid #e8f5e9; padding: 40px; border-radius: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
          .footer { text-align: center; margin-top: 40px; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #527a41; opacity: 0.6; }
          .button { display: inline-block; padding: 14px 32px; background-color: ${BRAND_COLOR}; color: white !important; text-decoration: none; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 20px; }
          .status-badge { display: inline-block; padding: 4px 12px; background: #f7fde8; color: ${BRAND_COLOR}; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; border: 1px solid #e8f5e9; }
          h1 { margin: 0 0 16px; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; line-height: 1.1; }
          p { margin: 0 0 20px; font-size: 15px; color: #527a41; }
          .divider { height: 1px; background: #e8f5e9; margin: 30px 0; }
          .meta-row { font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .tracking-box { background: #f7fde8; padding: 20px; margin: 20px 0; }
          .tracking-label { margin: 0; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
          .tracking-value { margin: 5px 0 0; font-size: 18px; font-weight: 900; color: ${BRAND_COLOR}; }
        </style>
      </head>
      <body>
        <!-- Gmail preview text hack: hidden preheader -->
        <div style="display:none;font-size:1px;color:#fffef7;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
          ${escapeHtml(previewText)}
        </div>
        <div class="container">
          <div class="header">
            <a href="${BASE_URL}" class="logo">TREEKART</a>
          </div>
          <div class="card">
            ${content}
          </div>
          <div class="footer">
            &copy; ${year} TREEKART &bull; ROOTED IN TRUST
          </div>
        </div>
      </body>
    </html>
   `;
}



// ── Order Emails ───────────────────────────────────────────────────────────────
export async function sendOrderConfirmedEmail(
  email: string,
  name: string,
  orderId: string,
  amount: number
): Promise<EmailResult> {
  validateFields({ email, name, orderId });

  if (typeof amount !== "number" || amount < 0) {
    throw new Error(`[EmailService] Validation failed: "amount" must be a non-negative number.`);
  }

  const safeName = escapeHtml(name);
  const safeShortId = escapeHtml(shortId(orderId));
  const formattedAmount = amount.toLocaleString("en-IN");

  const content = `
    <div class="status-badge">Order Confirmed</div>
    <h1>Thank You for Your Order</h1>
    <p>Hello ${safeName},</p>
    <p>We have received your order <strong>#${safeShortId}</strong>. Our farmers are already picking the freshest harvest for you.</p>
    <div class="divider"></div>
    <p class="meta-row">Amount Paid: &#8377;${formattedAmount}</p>
    <a href="${BASE_URL}/orders/${escapeHtml(orderId)}" class="button">Track Order</a>
  `;

  return sendEmail({
    to: email,
    subject: `Order Confirmed — #${safeShortId}`,
    html: emailLayout(
      content,
      `Your harvest is being prepared! Confirmation for order #${safeShortId}.`
    ),
    context: "sendOrderConfirmedEmail",
  });
}

export async function sendOrderShippedEmail(
  email: string,
  name: string,
  orderId: string,
  trackingId?: string
): Promise<EmailResult> {
  validateFields({ email, name, orderId });

  const safeName = escapeHtml(name);
  const safeShortId = escapeHtml(shortId(orderId));
  const safeTrackingId = trackingId ? escapeHtml(trackingId) : null;

  const trackingBlock = safeTrackingId
    ? `
      <div class="tracking-box">
        <p class="tracking-label">Tracking ID</p>
        <p class="tracking-value">${safeTrackingId}</p>
      </div>
    `
    : "";

  const content = `
    <div class="status-badge">On Its Way</div>
    <h1>Your Harvest Has Shipped</h1>
    <p>Great news, ${safeName}!</p>
    <p>Your order <strong>#${safeShortId}</strong> has left our groves and is headed to your doorstep.</p>
    ${trackingBlock}
    <a href="${BASE_URL}/orders/${escapeHtml(orderId)}" class="button">Track Shipment</a>
  `;

  return sendEmail({
    to: email,
    subject: `Order Shipped — #${safeShortId}`,
    html: emailLayout(
      content,
      `Your TreeKart harvest has been shipped and is on its way!`
    ),
    context: "sendOrderShippedEmail",
  });
}

export async function sendOrderDeliveredEmail(
  email: string,
  name: string,
  orderId: string
): Promise<EmailResult> {
  validateFields({ email, name, orderId });

  const safeName = escapeHtml(name);
  const safeShortId = escapeHtml(shortId(orderId));

  const content = `
    <div class="status-badge">Delivered</div>
    <h1>Order Delivered</h1>
    <p>Hello ${safeName},</p>
    <p>Your harvest from order <strong>#${safeShortId}</strong> has been delivered. We hope you enjoy the freshness of our groves!</p>
    <p>If you have any feedback or did not receive your order, please reply to this email and we will sort it out right away.</p>
    <a href="${BASE_URL}/orders/${escapeHtml(orderId)}" class="button">Rate Your Experience</a>
  `;

  return sendEmail({
    to: email,
    subject: `Order Delivered — #${safeShortId}`,
    html: emailLayout(content, `Your TreeKart order has been delivered. Enjoy!`),
    context: "sendOrderDeliveredEmail",
  });
}

// ── Contact Emails ─────────────────────────────────────────────────────────────

export async function sendContactEmail(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<EmailResult> {
  const { name, email, subject, message } = input;
  validateFields({ name, email, subject, message });

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  const content = `
    <div class="status-badge">New Contact Inquiry</div>
    <h1>New Message Received</h1>
    <p>You have received a new message from the contact form.</p>
    <div class="divider"></div>
    <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
    <p><strong>Subject:</strong> ${safeSubject}</p>
    <p><strong>Message:</strong></p>
    <div style="background: #f7fde8; padding: 20px; border-left: 4px solid ${BRAND_COLOR}; margin: 20px 0;">
      ${safeMessage}
    </div>
  `;

  return sendEmail({
    to: settings.EMAIL,
    subject: `Contact Form Inquiry: ${safeSubject}`,
    html: emailLayout(content, `New message from ${safeName} via Contact Form`),
    context: "sendContactEmail",
  });
}