"use client";

import { testPatientNotification } from "@/lib/actions/notification.actions";

const NotificationTestButton = ({ patientId }: { patientId: string }) => {
  const handleTest = async () => {
    try {
      const result = await testPatientNotification(patientId);

      if (result.success) {
        alert("✅ Test notification sent successfully!");
      } else {
        alert(`❌ Notification failed: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Something went wrong.");
    }
  };

  return (
    <button
      onClick={handleTest}
      className="rounded-md bg-blue-600 px-4 py-2 text-white"
    >
      Send Test Notification
    </button>
  );
};

export default NotificationTestButton;
