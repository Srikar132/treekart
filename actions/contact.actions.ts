"use server";

import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { ContactFormState, contactSchema } from "@/lib/validations";
import { contactAj } from "@/lib/arcjet";
import { headers } from "next/headers";


export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {


  const decision = await contactAj.protect({ headers: await headers() });
  if (decision.isDenied()) {
    return { error: "You're sending too many messages. Please wait." };
  }

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
