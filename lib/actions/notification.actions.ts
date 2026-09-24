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
