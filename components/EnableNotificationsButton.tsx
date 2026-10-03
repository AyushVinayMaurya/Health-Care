"use client";

import { useRef, useState } from "react";

import { saveFCMToken } from "@/lib/actions/patient.actions";
import { requestNotificationPermission } from "@/lib/firebase-messaging";

const EnableNotificationsButton = ({ patientId }: { patientId: string }) => {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const requestInProgress = useRef(false);

  const handleEnableNotifications = async () => {
    if (requestInProgress.current || enabled) return;

    requestInProgress.current = true;
    setLoading(true);

    try {
      const token = await requestNotificationPermission();

      if (!token) {
        alert("Notification permission was not granted.");
        return;
      }

      console.log("PHONE FCM TOKEN GENERATED:", !!token);

      const result = await saveFCMToken({
        patientId,
        fcmToken: token,
      });

      if (result) {
        setEnabled(true);
        alert("Notifications enabled successfully!");
      } else {
        alert("Failed to save notification token.");
      }
    } catch (error) {
      console.error("Notification setup error:", error);
      alert("Could not enable notifications.");
    } finally {
      requestInProgress.current = false;
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleEnableNotifications}
      disabled={loading || enabled}
      className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {enabled
        ? "✅ Notifications Enabled"
        : loading
          ? "Enabling..."
          : "🔔 Enable Notifications"}
    </button>
  );
};

export default EnableNotificationsButton;
