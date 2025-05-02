import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Replace these values with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAS-8juuGO9cpZIQ2x8J8hTDxZiz6uP3G8",
  authDomain: "markettrendanalyzer.firebaseapp.com",
  projectId: "markettrendanalyzer",
  storageBucket: "markettrendanalyzer.appspot.com",
  messagingSenderId: "1040665780481",
  appId: "1:1040665780481:web:14f5e667f59934ac68fb00",
  measurementId: "G-V21Z30VGC4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
