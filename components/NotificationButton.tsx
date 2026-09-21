"use client";

import { requestNotificationPermission } from "@/lib/firebase-messaging";
import { saveFCMToken } from "@/lib/actions/patient.actions";

interface NotificationButtonProps {
  userId: string;
}

export default function NotificationButton({
  userId,
}: NotificationButtonProps) {
  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission();

    if (!token) {
      alert("Could not enable notifications.");
      return;
    }

    const savedPatient = await saveFCMToken({
      userId,
      fcmToken: token,
    });

    if (!savedPatient) {
      alert("Notification permission granted, but token could not be saved.");
      return;
    }

    alert("Notifications enabled successfully!");
  };

  return (
    <button
      onClick={handleEnableNotifications}
      className="rounded-md bg-blue-600 px-4 py-2 text-white"
    >
      Enable Notifications
    </button>
  );
}
