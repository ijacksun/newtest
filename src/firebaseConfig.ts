// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔴 Substitua pelos dados do seu projeto no Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyD34CcpucrAhc2mXAVh5pALjtWsehMH2iA",
  authDomain: "testingstride.firebaseapp.com",
  projectId: "testingstride",
  storageBucket: "testingstride.firebasestorage.app",
  messagingSenderId: "912252616191",
  appId: "1:912252616191:web:9f0d171e337a2028093bca",
  measurementId: "G-MK3PXSF6LM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
