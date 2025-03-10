"use server";

import { symmetricEncrypt } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import {
  createCredentialSchema,
  createCredentialSchemaType,
} from "@/schema/credential";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function CreateCredential(form: createCredentialSchemaType) {
  try {
    const { success, data } = createCredentialSchema.safeParse(form);
    if (!success) {
      throw new Error("invalid form data");
    }

    const { userId } = auth();
    if (!userId) {
      throw new Error("unauthenticated");
    }

    // Check if a credential with the same name exists
    const existingCredential = await prisma.credential.findUnique({
      where: {
        userId_name: {
          userId,
          name: data.name,
        },
      },
    });

    if (existingCredential) {
      throw new Error(`A credential with the name "${data.name}" already exists`);
    }

    // Encrypt value
    const encryptedValue = symmetricEncrypt(data.value);

    const result = await prisma.credential.create({
      data: {
        userId,
        name: data.name,
        value: encryptedValue,
      },
    });

    if (!result) {
      throw new Error("failed to create credential");
    }

    revalidatePath("/credentials");
    return { success: true };
  } catch (error) {
    console.error("Failed to create credential:", error);
    throw error;
  }
}
