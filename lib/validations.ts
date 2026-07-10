import { z } from "zod";

// ── Phone + OTP auth ────────────────────────────────────────────────
// The UI accepts a bare 10-digit Indian mobile; it is normalized to E.164
// (lib/phone.ts) before ever reaching Supabase.

export const phoneSchema = z.object({
    phone: z
        .string()
        .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
});

export const otpSchema = z.object({
    otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

/**
 * Onboarding. Name is required; email is optional here — it is asked for again,
 * and required, at the point of ordering. Profile completeness is `full_name`
 * alone, so a user who skips email is never trapped in the dialog.
 */
export const profileCompletionSchema = z.object({
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z
        .union([z.string().email("Enter a valid email address"), z.literal("")])
        .optional(),
});

/** Checkout: an email is mandatory before an order can be created. */
export const orderEmailSchema = z.object({
    email: z.string().email("Enter a valid email address"),
});

/** Admin MFA recovery code redemption. */
export const recoveryCodeSchema = z.object({
    code: z.string().trim().min(8, "Enter a valid recovery code"),
});

export type PhoneFields = z.infer<typeof phoneSchema>;
export type OtpFields = z.infer<typeof otpSchema>;
export type ProfileCompletionFields = z.infer<typeof profileCompletionSchema>;
export type OrderEmailFields = z.infer<typeof orderEmailSchema>;

export type ActionState<T extends Record<string, string>> = {
    errors?: Partial<Record<keyof T | "_server", string>>;
    values?: Partial<T>;
    success?: boolean;
};

// schema for tree form
export const treeSchema = z.object({
    farmer_id: z.string().uuid("Select a valid farmer").or(z.null()).optional(),
    variety: z.string().min(2, "Variety must be at least 2 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    gps_lat: z.coerce.number().min(-90).max(90).nullable().optional(),
    gps_lng: z.coerce.number().min(-180).max(180).nullable().optional(),
    price: z.coerce.number().min(1, "Price is required"),
    age_years: z.coerce.number().min(1, "Age is required"),
    yield_min_kg: z.coerce.number().min(1, "Min yield is required"),
    yield_max_kg: z.coerce.number().min(1, "Max yield is required"),
    plan_id: z.string().min(1, "Plan is required"),
    source: z.enum(["own_farm", "partner"]),
    status: z.enum(["available", "rented", "inactive"]),
    photos: z.array(z.string()).max(4, "Maximum 4 photos allowed").optional().default([]),
}).refine(
    (d) => {
        if (d.yield_max_kg === undefined || d.yield_min_kg === undefined) return true;
        return d.yield_max_kg >= d.yield_min_kg;
    },
    { message: "Max yield must be ≥ min yield", path: ["yield_max_kg"] }
)

export type TreeFormValues = z.infer<typeof treeSchema>

// schema for tree update form
export const treeUpdateSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    video_url: z.string().url("Enter a valid video URL").or(z.literal("")).optional(),
});

export type TreeUpdateFormValues = z.infer<typeof treeUpdateSchema>

// schema for mango product form
export const productSchema = z.object({
    name: z.string().min(2, "Product name is required"),
    variety: z.string().min(2, "Variety is required"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    price: z.coerce.number().min(1, "Price is required"),
    original_price: z.coerce.number().optional().nullable(),
    weight_kg: z.array(z.coerce.number()).min(1, "At least one weight variant is required"),
    badge: z.enum(["New", "Sale", "Pre-Order", "None"]).default("None"),
    status: z.enum(["available", "out_of_stock", "pre_order"]).default("available"),
    image_url: z.array(z.string()).min(1, "At least one image is required"),
});

export type ProductFormValues = z.infer<typeof productSchema>

// schema for blog form
export const blogSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
    category: z.string().min(1, "Category is required"),
    author: z.string().min(1, "Author is required"),
    excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
    content: z.string().min(20, "Content must be at least 20 characters"),
    published_at: z.string().min(1, "Publication date is required"),
});

export type BlogFormValues = z.infer<typeof blogSchema>

// schema for hero slide form
export const heroSlideSchema = z.object({
    eyebrow: z.string().min(2, "Eyebrow is required"),
    title: z.string().min(2, "Title is required"),
    sub_heading: z.string().min(2, "Sub-heading is required"),
    description: z.string().min(2, "Description is required"),
    image_url: z.string().url("Valid image URL is required"),
    button_label: z.string().min(1, "Button label is required"),
    button_link: z.string().min(1, "Button link is required"),
    order_index: z.coerce.number().int().min(0).optional().default(0),
});

export type HeroSlideFormValues = z.infer<typeof heroSlideSchema>;

// schema for testimonial form
export const testimonialSchema = z.object({
    name: z.string().min(2, "Name is required"),
    role: z.string().min(2, "Role is required"),
    content: z.string().min(10, "Review must be at least 10 characters"),
    rating: z.coerce.number().min(1).max(5),
    avatar_url: z.string().url("Valid avatar URL is required").or(z.literal("")).optional(),
});

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;



export const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Enter a valid phone number"),
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormState = {
    success?: boolean;
    error?: string;
    fieldErrors?: Record<string, string[]>;
};

export const featureSchema = z.object({
    text: z.string().min(1, "Text is required"),
    isHighlight: z.boolean().default(false),
    highlightColor: z.string().optional()
});

export const treePlanSchema = z.object({
    name: z.string().min(1, "Name is required"),
    badge_text: z.string().optional(),
    badge_color: z.string().optional(),
    features: z.array(featureSchema).min(1, "At least one feature is required"),
    is_active: z.boolean().default(true),
});

export type TreePlanFormValues = z.infer<typeof treePlanSchema>;