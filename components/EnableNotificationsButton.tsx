"use client";

import { requestNotificationPermission } from "@/lib/firebase-messaging";
import { saveFCMToken } from "@/lib/actions/patient.actions";

const EnableNotificationsButton = ({ patientId }: { patientId: string }) => {
  const handleEnableNotifications = async () => {
    try {
      const token = await requestNotificationPermission();

      if (!token) {
        alert("❌ Notification permission was not granted.");
        return;
      }

      console.log("PHONE FCM TOKEN GENERATED:", !!token);

      const result = await saveFCMToken({
        patientId,
        fcmToken: token,
      });

      if (result) {
        alert("✅ Notifications enabled successfully!");
      } else {
        alert("❌ Failed to save notification token.");
      }
    } catch (error) {
      console.error("Notification setup error:", error);
      alert("❌ Could not enable notifications.");
    }
  };

  return (
    <button
      onClick={handleEnableNotifications}
      className="rounded-md bg-blue-600 px-4 py-2 text-white"
    >
      🔔 Enable Notifications
    </button>
  );
};

export default EnableNotificationsButton;
