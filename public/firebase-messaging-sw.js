importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyD2InQUCVnJkhU8twt2bbT_Mi58xrJWnjE",
  authDomain: "healthcare-14569.firebaseapp.com",
  projectId: "healthcare-14569",
  storageBucket: "healthcare-14569.firebasestorage.app",
  messagingSenderId: "574908101997",
  appId: "1:574908101997:web:8e49d7f999f38f3ea0d664",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);

  const title = payload.notification?.title || "CarePulse";

  const options = {
    body:
      payload.notification?.body ||
      "You have a new notification from CarePulse.",
    icon: "/assets/icons/logo-icon.svg",
  };

  self.registration.showNotification(title, options);
});
