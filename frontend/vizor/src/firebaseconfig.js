// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "sketchcompendium-b3af3.firebaseapp.com",
  projectId: "sketchcompendium-b3af3",
  storageBucket: "sketchcompendium-b3af3.appspot.com",
  messagingSenderId: "327115953636",
  appId: "1:327115953636:web:530d9d938e4c5f4e1f23f1",
  measurementId: "G-8TMG0VQSL0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { firestore, storage };