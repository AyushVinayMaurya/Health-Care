"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { Appointment } from "@/types/appwrite.types";

import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  databases,
} from "../appwrite.config";

import { sendPushNotification } from "./notification.actions";

import { formatDateTime, parseStringify } from "../utils";

// CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );

    revalidatePath("/admin");

    return parseStringify(newAppointment);
  } catch (error) {
    console.error("An error occurred while creating a new appointment:", error);

    return null;
  }
};

// GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt"), Query.select(["*", "patient.*"])]
    );

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        switch (appointment.status) {
          case "scheduled":
            acc.scheduledCount++;
            break;

          case "pending":
            acc.pendingCount++;
            break;

          case "cancelled":
            acc.cancelledCount++;
            break;
        }

        return acc;
      },
      initialCounts
    );

    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents,
    };

    return parseStringify(data);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the recent appointments:",
      error
    );

    return null;
  }
};

// SEND PUSH NOTIFICATION TO PATIENT
const sendPatientPushNotification = async ({
  userId,
  title,
  body,
}: {
  userId: string;
  title: string;
  body: string;
}) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );

    if (patients.documents.length === 0) {
      console.log("Patient not found:", userId);
      return false;
    }

    const patient = patients.documents[0];

    if (!patient.fcmToken) {
      console.log("Patient does not have an FCM token.");
      return false;
    }

    await sendPushNotification({
      token: patient.fcmToken,
      title,
      body,
    });

    console.log("Push notification sent successfully.");

    return true;
  } catch (error) {
    console.error("An error occurred while sending push notification:", error);

    return false;
  }
};

// UPDATE APPOINTMENT
export const updateAppointment = async ({
  appointmentId,
  userId,
  timeZone,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    // Update appointment in Appwrite
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );

    if (!updatedAppointment) {
      throw new Error("Appointment could not be updated.");
    }

    const appointmentDateTime = formatDateTime(
      updatedAppointment.schedule!,
      timeZone
    ).dateTime;

    // APPOINTMENT CONFIRMED
    if (type === "schedule") {
      await sendPatientPushNotification({
        userId,
        title: "Appointment Confirmed 🏥",
        body: `Your appointment is confirmed for ${appointmentDateTime} with Dr. ${updatedAppointment.primaryPhysician}.`,
      });
    }

    // APPOINTMENT CANCELLED
    if (type === "cancel") {
      await sendPatientPushNotification({
        userId,
        title: "Appointment Cancelled ❌",
        body: `Your appointment for ${appointmentDateTime} has been cancelled. Reason: ${
          updatedAppointment.cancellationReason || "No reason provided"
        }.`,
      });
    }

    revalidatePath("/admin");

    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error("An error occurred while updating the appointment:", error);

    return null;
  }
};

// GET APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    return parseStringify(appointment);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the existing appointment:",
      error
    );

    return null;
  }
};
