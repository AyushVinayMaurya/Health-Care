"use server";

import { adminMessaging } from "../firebase-admin";

export const sendPushNotification = async ({
  token,
  title,
  body,
}: {
  token: string;
  title: string;
  body: string;
}) => {
  try {
    const response = await adminMessaging.send({
      token,
      notification: {
        title,
        body,
      },
    });

    console.log("FCM notification sent successfully:", response);

    return {
      success: true,
      messageId: response,
    };
  } catch (error) {
    console.error("FCM notification error:", error);

    return {
      success: false,
      error: String(error),
    };
  }
};

// TESTING THE NOTIFICATION FUNCTION

import { databases } from "../appwrite.config";
import { DATABASE_ID, PATIENT_COLLECTION_ID } from "../appwrite.config";
import { Query } from "node-appwrite";

export const testPatientNotification = async (patientId: string) => {
  try {
    const patient = await databases.getDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId
    );

    if (!patient.fcmToken) {
      console.log("No FCM token found for this patient.");

      return {
        success: false,
        error: "FCM token not found",
      };
    }

    return await sendPushNotification({
      token: patient.fcmToken,
      title: "CarePulse Test Notification 🔔",
      body: "Your CarePulse push notification system is working!",
    });
  } catch (error) {
    console.error("Test notification error:", error);

    return {
      success: false,
      error: String(error),
    };
  }
};
