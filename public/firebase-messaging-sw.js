importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js');

const firebaseConfig = {
  apiKey: 'AIzaSyDs7NCwENn6CFdF-wBrNP6Fq-3lPYjZiCM',
  authDomain: 'referddev.firebaseapp.com',
  projectId: 'referddev',
  storageBucket: 'referddev.appspot.com',
  messagingSenderId: '1040711464374',
  appId: '1:1040711464374:web:6c01b552ee805e47fc3d17',
  measurementId: 'G-X9C2L47YK9',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//   console.log('Received background message', payload);
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = { body: payload.notification.body };
//   self.registration.showNotification(notificationTitle, notificationOptions);
// });
