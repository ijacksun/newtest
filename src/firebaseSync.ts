// src/firebaseSync.ts
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// envia alterações para o Firestore
function syncToFirestore(uid: string, key: string, value: any) {
  const userRef = doc(db, "users", uid);
  setDoc(userRef, { [key]: value }, { merge: true });
}

// intercepta localStorage.setItem
const originalSetItem = localStorage.setItem;
localStorage.setItem = function (key: string, value: string) {
  const uid = auth.currentUser?.uid;
  if (uid) {
    try {
      const parsed = JSON.parse(value);
      syncToFirestore(uid, key, parsed);
    } catch {
      syncToFirestore(uid, key, value);
    }
  }
  return originalSetItem.apply(this, [key, value]);
};

// intercepta localStorage.removeItem
const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function (key: string) {
  const uid = auth.currentUser?.uid;
  if (uid) {
    syncToFirestore(uid, key, null);
  }
  return originalRemoveItem.apply(this, [key]);
};

// ao logar, restaura os dados do Firestore no localStorage
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }
    } else {
      await setDoc(userRef, {});
    }
  }
});
