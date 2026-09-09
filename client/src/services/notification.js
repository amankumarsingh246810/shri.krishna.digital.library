import {
  getToken,
  onMessage
} from "firebase/messaging";

import {
  getFirebaseMessaging,
  auth
} from "./firebase";

import api from "./api";

const VAPID_KEY =
  import.meta.env
    .VITE_FIREBASE_VAPID_KEY;

export async function requestNotificationPermission() {
  try {
    if (!("Notification" in window)) {
      return {
        success: false,
        message:
          "This browser does not support notifications."
      };
    }

    if (!VAPID_KEY) {
      return {
        success: false,
        message:
          "Firebase VAPID key is not configured."
      };
    }

    const permission =
      await Notification.requestPermission();

    if (permission !== "granted") {
      return {
        success: false,
        permission,
        message:
          "Notification permission was not granted."
      };
    }

    const messaging =
      await getFirebaseMessaging();

    if (!messaging) {
      return {
        success: false,
        message:
          "Firebase messaging is not supported by this browser."
      };
    }

    const token =
      await getToken(
        messaging,
        {
          vapidKey: VAPID_KEY
        }
      );

    if (!token) {
      return {
        success: false,
        message:
          "Unable to generate Firebase device token."
      };
    }

    const firebaseUser =
      auth.currentUser;

    if (!firebaseUser) {
      return {
        success: false,
        message:
          "Student Firebase session not found."
      };
    }

    const idToken =
      await firebaseUser.getIdToken();

    await api.post(
      "/student-auth/fcm-token",
      {
        token
      },
      {
        headers: {
          Authorization:
            `Bearer ${idToken}`
        }
      }
    );

    return {
      success: true,
      token
    };
  } catch (error) {
    console.error(
      "Notification permission error:",
      error
    );

    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to enable notifications."
    };
  }
}

export async function registerCurrentDevice() {
  return requestNotificationPermission();
}

export async function listenForForegroundMessages(
  callback
) {
  try {
    const messaging =
      await getFirebaseMessaging();

    if (!messaging) {
      return () => {};
    }

    return onMessage(
      messaging,
      (payload) => {
        console.log(
          "Foreground notification:",
          payload
        );

        if (callback) {
          callback(payload);
        }
      }
    );
  } catch (error) {
    console.error(
      "Foreground notification listener error:",
      error
    );

    return () => {};
  }
}