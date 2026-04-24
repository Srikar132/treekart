"use server";

import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { ContactFormState, contactSchema } from "@/lib/validations";



export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
  };

  const validated = contactSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await sendContactEmail(validated.data);

    if (!result.success) {
      return { error: result.error || "Failed to send email" };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
  }
}
