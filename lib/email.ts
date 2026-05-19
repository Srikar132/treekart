import { Resend } from "resend";
import settings from "@/constants/settings";

if (!process.env.RESEND_API_KEY) {
  throw new Error("[EmailService] RESEND_API_KEY environment variable is not set.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const BRAND_COLOR = "#2d8a1a";
const FROM_ADDRESS = `TreeKart <${settings.EMAIL}>`;
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.treekart.in").replace(/\/$/, "");

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function validateFields(fields: Record<string, string | number>): void {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || String(value).trim() === "") {
      throw new Error(`[EmailService] Validation failed: "${key}" is required and cannot be empty.`);
    }
  }
}

async function sendEmail({
  to,
  subject,
  html,
  context,
}: {
  to: string;
  subject: string;
  html: string;
  context: string;
}): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`[EmailService] [${context}] Resend API error for <${to}>:`, error);
      return { success: false, error: error.message };
    }

    console.log(`[EmailService] [${context}] Sent successfully to <${to}> — messageId: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (err) {
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
          *, *::before, *::after { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a3a08; margin: 0; padding: 0; background-color: #fffef7; -webkit-text-size-adjust: 100%; }
          .wrapper { width: 100%; background-color: #fffef7; padding: 20px 0; }
          .container { max-width: 600px; width: 100%; margin: 0 auto; padding: 24px 20px; }
          .header { text-align: center; margin-bottom: 32px; }
          .logo { font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; color: ${BRAND_COLOR}; text-decoration: none; display: inline-block; }
          .logo-dot { color: #a8c89a; }
          .card { background: #ffffff; border: 1px solid #d4e8cc; padding: 32px; box-shadow: 0 2px 8px rgba(45, 138, 26, 0.06); }
          .footer { text-align: center; margin-top: 32px; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #527a41; opacity: 0.7; line-height: 1.8; }
          .button { display: inline-block; padding: 14px 28px; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 24px; border-radius: 0; }
          .button-outline { display: inline-block; padding: 12px 24px; background-color: transparent; color: ${BRAND_COLOR} !important; text-decoration: none; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 12px; border: 2px solid ${BRAND_COLOR}; }
          .status-badge { display: inline-block; padding: 5px 14px; background: #f0f9eb; color: ${BRAND_COLOR}; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px; border: 1px solid #c5e0ba; }
          .status-badge-warning { background: #fffbeb; color: #92400e; border-color: #fde68a; }
          .status-badge-info { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
          h1 { margin: 0 0 16px; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; line-height: 1.15; color: #1a3a08; }
          p { margin: 0 0 16px; font-size: 15px; color: #527a41; line-height: 1.7; }
          .divider { height: 1px; background: #d4e8cc; margin: 24px 0; }
          .meta-row { font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #1a3a08; margin: 0 0 8px; }
          .info-box { background: #f0f9eb; padding: 20px 24px; margin: 20px 0; border-left: 3px solid ${BRAND_COLOR}; }
          .info-box p { margin: 0; font-size: 13px; }
          .tracking-box { background: #f0f9eb; padding: 20px 24px; margin: 20px 0; border: 1px solid #c5e0ba; }
          .tracking-label { margin: 0 0 4px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: #527a41; }
          .tracking-value { margin: 0; font-size: 20px; font-weight: 900; color: ${BRAND_COLOR}; letter-spacing: 1px; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e8f5e1; font-size: 13px; }
          .detail-label { color: #527a41; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          .detail-value { color: #1a3a08; font-weight: 900; text-align: right; }
          @media screen and (max-width: 480px) {
            .container { padding: 16px 12px !important; }
            .card { padding: 24px 16px !important; }
            h1 { font-size: 20px !important; }
            .button { display: block !important; text-align: center !important; width: 100% !important; padding: 16px 12px !important; }
            .button-outline { display: block !important; text-align: center !important; width: 100% !important; padding: 14px 12px !important; }
            .detail-row { flex-direction: column !important; gap: 2px; }
            .detail-value { text-align: left !important; }
          }
        </style>
      </head>
      <body>
        <div style="display:none;font-size:1px;color:#fffef7;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
          ${escapeHtml(previewText)}
        </div>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <a href="${BASE_URL}" class="logo">TREE<span class="logo-dot">&#x25CF;</span>KART</a>
            </div>
            <div class="card">
              ${content}
            </div>
            <div class="footer">
              &copy; ${year} TREEKART &bull; ROOTED IN TRUST<br>
              <a href="${BASE_URL}" style="color: #527a41; text-decoration: none;">${BASE_URL.replace("https://", "")}</a>
            </div>
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
    <h1>Thank You For Your Order</h1>
    <p>Hello ${safeName},</p>
    <p>We've received your order <strong>#${safeShortId}</strong>. Our farmers are already picking the freshest harvest for you.</p>
    <div class="divider"></div>
    <div class="tracking-box">
      <p class="tracking-label">Amount Paid</p>
      <p class="tracking-value">&#8377;${formattedAmount}</p>
    </div>
    <p style="font-size: 13px; color: #527a41;">You'll receive another email once your order ships. Track your order anytime from your account.</p>
    <a href="${BASE_URL}/account" class="button">Track My Order</a>
  `;

  return sendEmail({
    to: email,
    subject: `Order Confirmed — #${safeShortId}`,
    html: emailLayout(content, `Your harvest is being prepared! Confirmation for order #${safeShortId}.`),
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
    <div class="status-badge status-badge-info">On Its Way</div>
    <h1>Your Harvest Has Shipped</h1>
    <p>Great news, ${safeName}!</p>
    <p>Your order <strong>#${safeShortId}</strong> has left our groves and is headed to your doorstep. Expect delivery in 2–4 business days.</p>
    ${trackingBlock}
    <a href="${BASE_URL}/account" class="button">Track Shipment</a>
  `;

  return sendEmail({
    to: email,
    subject: `Shipped — Order #${safeShortId} Is On Its Way`,
    html: emailLayout(content, `Your TreeKart harvest has shipped and is on its way!`),
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
    <div class="info-box">
      <p>If you have any feedback or didn't receive your order, simply reply to this email — we'll make it right immediately.</p>
    </div>
    <a href="${BASE_URL}/account" class="button">View My Orders</a>
  `;

  return sendEmail({
    to: email,
    subject: `Delivered — Order #${safeShortId}`,
    html: emailLayout(content, `Your TreeKart order has been delivered. Enjoy the freshness!`),
    context: "sendOrderDeliveredEmail",
  });
}


export async function sendOrderCancelledEmail(
  email: string,
  name: string,
  orderId: string,
  amount: number,
  refundInitiated: boolean
): Promise<EmailResult> {
  validateFields({ email, name, orderId });
  if (typeof amount !== "number" || amount < 0) {
    throw new Error(`[EmailService] Validation failed: "amount" must be a non-negative number.`);
  }

  const safeName = escapeHtml(name);
  const safeShortId = escapeHtml(shortId(orderId));
  const formattedAmount = amount.toLocaleString("en-IN");

  const refundNote = refundInitiated
    ? `<div class="info-box"><p>A refund of <strong>&#8377;${formattedAmount}</strong> has been initiated and will be credited to your original payment method within 5–7 business days.</p></div>`
    : `<div class="info-box"><p>If you have any questions about this cancellation, please reply to this email and our team will assist you promptly.</p></div>`;

  const content = `
    <div class="status-badge status-badge-warning">Order Cancelled</div>
    <h1>Your Order Has Been Cancelled</h1>
    <p>Hello ${safeName},</p>
    <p>We regret to inform you that your order <strong>#${safeShortId}</strong> has been cancelled by our team.</p>
    ${refundNote}
    <a href="${BASE_URL}/account" class="button">View My Orders</a>
    <a href="${BASE_URL}/store" class="button-outline">Shop Again</a>
  `;

  return sendEmail({
    to: email,
    subject: `Order Cancelled — #${safeShortId}`,
    html: emailLayout(content, `Your TreeKart order #${safeShortId} has been cancelled.`),
    context: "sendOrderCancelledEmail",
  });
}


// ── Rental Emails ──────────────────────────────────────────────────────────────

export async function sendRentalConfirmedEmail(
  email: string,
  name: string,
  rentalId: string,
  variety: string,
  amount: number,
  season: string
): Promise<EmailResult> {
  validateFields({ email, name, rentalId, variety, season });

  const safeName = escapeHtml(name);
  const safeShortId = escapeHtml(shortId(rentalId));
  const safeVariety = escapeHtml(variety);
  const safeSeason = escapeHtml(season);
  const formattedAmount = amount.toLocaleString("en-IN");

  const content = `
    <div class="status-badge">Rental Confirmed</div>
    <h1>Your Tree Is Reserved</h1>
    <p>Hello ${safeName},</p>
    <p>Welcome to the grove! Your <strong>${safeVariety} mango tree</strong> has been successfully reserved for the <strong>${safeSeason}</strong> harvest season.</p>
    <div class="divider"></div>
    <p class="meta-row">Rental Details</p>
    <div class="detail-row">
      <span class="detail-label">Reference</span>
      <span class="detail-value">#${safeShortId}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Tree Variety</span>
      <span class="detail-value">${safeVariety}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Season</span>
      <span class="detail-value">${safeSeason}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Amount Paid</span>
      <span class="detail-value">&#8377;${formattedAmount}</span>
    </div>
    <div class="divider"></div>
    <div class="info-box">
      <p>Our farmers will send you photo and video updates of your tree throughout the growing season. You'll be notified here and through WhatsApp.</p>
    </div>
    <a href="${BASE_URL}/account" class="button">View My Tree</a>
  `;

  return sendEmail({
    to: email,
    subject: `Rental Confirmed — Your ${safeVariety} Tree Is Reserved`,
    html: emailLayout(content, `Your ${variety} mango tree is reserved for the ${season} season!`),
    context: "sendRentalConfirmedEmail",
  });
}

export async function sendRentalStatusUpdateEmail(
  email: string,
  name: string,
  rentalId: string,
  variety: string,
  status: "completed" | "cancelled"
): Promise<EmailResult> {
  validateFields({ email, name, rentalId, variety });

  const safeName = escapeHtml(name);
  const safeShortId = escapeHtml(shortId(rentalId));
  const safeVariety = escapeHtml(variety);

  const isCompleted = status === "completed";

  const content = isCompleted
    ? `
      <div class="status-badge">Season Complete</div>
      <h1>Harvest Season Wrapped Up</h1>
      <p>Hello ${safeName},</p>
      <p>The harvest season for your <strong>${safeVariety} mango tree</strong> (Ref: #${safeShortId}) has been successfully completed.</p>
      <p>Thank you for being part of the TreeKart family this season. We hope you enjoyed every mango from your tree!</p>
      <div class="info-box">
        <p>Your tree will be available for re-rental in the next season. Stay tuned for early-bird offers.</p>
      </div>
      <a href="${BASE_URL}/account" class="button">View Rental History</a>
      <a href="${BASE_URL}/rent" class="button-outline">Rent For Next Season</a>
    `
    : `
      <div class="status-badge status-badge-warning">Rental Cancelled</div>
      <h1>Rental Cancellation Notice</h1>
      <p>Hello ${safeName},</p>
      <p>Your rental for the <strong>${safeVariety} mango tree</strong> (Ref: #${safeShortId}) has been cancelled.</p>
      <div class="info-box">
        <p>If this was unexpected or you have questions, please contact our support team by replying to this email. Refunds are processed within 5–7 business days.</p>
      </div>
      <a href="${BASE_URL}/account" class="button">View My Account</a>
    `;

  return sendEmail({
    to: email,
    subject: isCompleted
      ? `Season Complete — Your ${variety} Tree Rental`
      : `Rental Cancelled — Ref #${safeShortId}`,
    html: emailLayout(
      content,
      isCompleted
        ? `The harvest season for your ${variety} tree is complete. Thanks for being part of TreeKart!`
        : `Your tree rental (Ref #${safeShortId}) has been cancelled.`
    ),
    context: "sendRentalStatusUpdateEmail",
  });
}

export async function sendTreeUpdatePostedEmail(
  email: string,
  name: string,
  variety: string,
  updateTitle: string,
  updateDescription: string | null,
  rentalId: string
): Promise<EmailResult> {
  validateFields({ email, name, variety, updateTitle });

  const safeName = escapeHtml(name);
  const safeVariety = escapeHtml(variety);
  const safeTitle = escapeHtml(updateTitle);
  const safeDesc = updateDescription ? escapeHtml(updateDescription) : "";

  const content = `
    <div class="status-badge status-badge-info">Tree Update</div>
    <h1>New Update From Your Grove</h1>
    <p>Hello ${safeName},</p>
    <p>Your <strong>${safeVariety} mango tree</strong> has a new update from our farmers:</p>
    <div class="tracking-box">
      <p class="tracking-label">Update</p>
      <p style="margin: 8px 0 0; font-size: 16px; font-weight: 900; color: #1a3a08;">${safeTitle}</p>
      ${safeDesc ? `<p style="margin: 8px 0 0; font-size: 14px; color: #527a41;">${safeDesc}</p>` : ""}
    </div>
    <p style="font-size: 13px; color: #527a41;">View photos and videos from your tree in your account dashboard.</p>
    <a href="${BASE_URL}/account" class="button">View Tree Update</a>
  `;

  return sendEmail({
    to: email,
    subject: `Grove Update: ${updateTitle} — Your ${variety} Tree`,
    html: emailLayout(content, `New update from your ${variety} mango tree: ${updateTitle}`),
    context: "sendTreeUpdatePostedEmail",
  });
}


// ── Contact Emails ─────────────────────────────────────────────────────────────

export async function sendContactEmail(input: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<EmailResult> {
  const { name, email, phone, subject, message } = input;
  validateFields({ name, email, phone, subject, message });

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  const content = `
    <div class="status-badge status-badge-info">New Inquiry</div>
    <h1>New Message Received</h1>
    <p>You have received a new message from the contact form.</p>
    <div class="divider"></div>
    <div class="detail-row">
      <span class="detail-label">From</span>
      <span class="detail-value">${safeName}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Email</span>
      <span class="detail-value">${safeEmail}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Phone</span>
      <span class="detail-value">${safePhone}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Subject</span>
      <span class="detail-value">${safeSubject}</span>
    </div>
    <div class="divider"></div>
    <p class="meta-row">Message</p>
    <div class="info-box">
      <p style="font-size: 14px; white-space: pre-wrap;">${safeMessage}</p>
    </div>
  `;

  return sendEmail({
    to: settings.EMAIL,
    subject: `Contact Form: ${safeSubject}`,
    html: emailLayout(content, `New message from ${name} via Contact Form`),
    context: "sendContactEmail",
  });
}
