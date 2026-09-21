"use client";

import { getMessaging, getToken, isSupported } from "firebase/messaging";

import { firebaseApp } from "./firebase";

export async function requestNotificationPermission() {
  try {
    const supported = await isSupported();

    if (!supported) {
      console.log("Firebase Messaging is not supported.");
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied.");
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    await navigator.serviceWorker.ready;

    const messaging = getMessaging(firebaseApp);

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
      serviceWorkerRegistration: registration,
    });

    console.log("FCM Token generated successfully.");

    return token;
  } catch (error) {
    console.error("Firebase Messaging registration failed:", error);
    return null;
  }
}
