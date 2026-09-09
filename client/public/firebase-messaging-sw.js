importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey:
    "AIzaSyCnAAFLTj84hxZONQkJR3ecZFZobNX0J5E",

  authDomain:
    "shri-krishna-digital-library.firebaseapp.com",

  projectId:
    "shri-krishna-digital-library",

  storageBucket:
    "shri-krishna-digital-library.firebasestorage.app",

  messagingSenderId:
    "806454357294",

  appId:
    "1:806454357294:web:243a85eddb9247a1615ebf"
});

const messaging =
  firebase.messaging();

messaging.onBackgroundMessage(
  function (payload) {
    console.log(
      "[firebase-messaging-sw.js] Background message:",
      payload
    );

    const notificationTitle =
      payload.notification?.title ||
      "Shri Krishna Digital Library";

    const notificationOptions = {
      body:
        payload.notification?.body ||
        "You have a new notification.",

      icon: "/favicon.ico",

      data:
        payload.data || {}
    };

    self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  }
);

self.addEventListener(
  "notificationclick",
  function (event) {
    event.notification.close();

    event.waitUntil(
      clients.matchAll({
        type: "window",
        includeUncontrolled: true
      }).then(
        function (clientList) {
          for (
            const client of clientList
          ) {
            if (
              "focus" in client
            ) {
              return client.focus();
            }
          }

          if (
            clients.openWindow
          ) {
            return clients.openWindow(
              "/student/dashboard"
            );
          }
        }
      )
    );
  }
);