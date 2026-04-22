import { z } from "zod";

export const signInSchema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
    .object({
        fullName: z.string().min(1, "Full name is required"),
        email: z.string().email("Enter a valid email address"),
        phone: z
            .string()
            .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type SignInFields = z.infer<typeof signInSchema>;
export type SignUpFields = z.infer<typeof signUpSchema>;

export type ActionState<T extends Record<string, string>> = {
    errors?: Partial<Record<keyof T | "_server", string>>;
    values?: Partial<T>;
};