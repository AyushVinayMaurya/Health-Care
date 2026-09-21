"use server";

import { ID, Query } from "node-appwrite";

import {
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  databases,
  storage,
  users,
} from "../appwrite.config";
import { parseStringify } from "../utils";

// CREATE USER
export const createUser = async (user: CreateUserParams) => {
  try {
    const newuser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );

    return parseStringify(newuser);
  } catch (error: any) {
    // Check if user already exists
    if (error?.code === 409) {
      try {
        const existingUser = await users.list([
          Query.equal("email", [user.email]),
        ]);

        if (existingUser.users.length > 0) {
          return parseStringify(existingUser.users[0]);
        }
      } catch (listError) {
        console.error(
          "An error occurred while finding existing user:",
          listError
        );
      }
    }

    console.error("An error occurred while creating a new user:", error);

    return null;
  }
};

// GET USER
export const getUser = async (userId: string) => {
  try {
    if (!userId) {
      console.error("getUser: userId is missing");
      return null;
    }

    const user = await users.get(userId);

    return parseStringify(user);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the user details:",
      error
    );

    return null;
  }
};

// REGISTER PATIENT
export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    const gender = String(patient.gender ?? "")
      .trim()
      .toLowerCase();

    if (!["male", "female", "other"].includes(gender)) {
      throw new Error(
        `Invalid gender value: "${patient.gender}". Expected male, female, or other.`
      );
    }

    let file;

    if (identificationDocument) {
      const blobFile = identificationDocument.get("blobFile") as Blob;
      const fileName = identificationDocument.get("fileName") as string;

      if (blobFile && fileName) {
        const inputFile = new File([await blobFile.arrayBuffer()], fileName, {
          type: blobFile.type,
        });

        file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
      }
    }

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id ?? null,
        identificationDocumentUrl: file?.$id
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`
          : null,
        ...patient,
        gender,
      }
    );

    return parseStringify(newPatient);
  } catch (error) {
    console.error("An error occurred while creating a new patient:", error);

    return null;
  }
};

// GET PATIENT
export const getPatient = async (userId: string) => {
  try {
    if (!userId) {
      console.error("getPatient: userId is missing");
      return null;
    }

    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );

    if (patients.documents.length === 0) {
      return null;
    }

    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the patient details:",
      error
    );

    return null;
  }
};
// SAVE FCM TOKEN

export const saveFCMToken = async ({
  patientId,
  fcmToken,
}: {
  patientId: string;
  fcmToken: string;
}) => {
  try {
    const updatedPatient = await databases.updateDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId,
      {
        fcmToken,
      }
    );

    return parseStringify(updatedPatient);
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return null;
  }
};
