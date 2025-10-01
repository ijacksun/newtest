// src/firebaseSync.ts
// This module syncs localStorage keys with Firestore under users/{uid}.localStorage
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, deleteField } from "firebase/firestore";

type AnyObject = { [k: string]: any };

let currentUser: User | null = null;
let initialSync = false; // flag to prevent write-back during initial load

async function loadUserLocalStorage(uid: string) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as AnyObject;
      const lsMap = data?.localStorage || {};
      initialSync = true;
      try {
        Object.keys(lsMap).forEach((k) => {
          const v = lsMap[k];
          // store as stringified JSON for compatibility with previous usage
          try {
            localStorage.setItem(k, JSON.stringify(v));
          } catch (e) {
            // if storage fails, ignore
            console.warn("Failed to write to localStorage", e);
          }
        });
      } finally {
        // small delay to ensure any immediate setItem calls during hydration don't trigger writes
        setTimeout(() => { initialSync = false; }, 300);
      }
    }
  } catch (e) {
    console.error("Error loading user data from Firestore:", e);
    initialSync = false;
  }
}

async function writeKeyToFirestore(key: string, value: any) {
  if (!currentUser) return;
  try {
    const ref = doc(db, "users", currentUser.uid);
    // Use merge to only update the localStorage map
    await setDoc(ref, { localStorage: { [key]: value } }, { merge: true });
  } catch (e) {
    console.error("Failed to write key to Firestore", e);
  }
}

async function removeKeyFromFirestore(key: string) {
  if (!currentUser) return;
  try {
    const ref = doc(db, "users", currentUser.uid);
    // To delete a nested field in Firestore we need updateDoc with deleteField, but here we'll set the specific key to delete via updateDoc
    const updates: AnyObject = {};
    updates[`localStorage.${key}`] = deleteField();
    await updateDoc(ref, updates);
  } catch (e) {
    console.error("Failed to remove key from Firestore", e);
  }
}

function patchLocalStorage() {
  try {
    const origSet = Storage.prototype.setItem;
    const origRemove = Storage.prototype.removeItem;
    // @ts-ignore
    Storage.prototype.setItem = function (key: string, value: string) {
      // call original
      origSet.call(this, key, value);
      if (initialSync) return;
      if (currentUser) {
        let parsed: any = value;
        try {
          parsed = JSON.parse(value);
        } catch (e) {
          // keep string if not JSON
          parsed = value;
        }
        writeKeyToFirestore(key, parsed);
      }
    };
    // @ts-ignore
    Storage.prototype.removeItem = function (key: string) {
      origRemove.call(this, key);
      if (initialSync) return;
      if (currentUser) {
        removeKeyFromFirestore(key);
      }
    };
  } catch (e) {
    console.error("Failed to patch localStorage", e);
  }
}

function createAuthUI() {
  // create a small floating auth widget
  const containerId = "firebase-auth-widget";
  if (document.getElementById(containerId)) return;
  const container = document.createElement("div");
  container.id = containerId;
  container.style.position = "fixed";
  container.style.bottom = "16px";
  container.style.right = "16px";
  container.style.zIndex = "9999";
  container.style.background = "rgba(255,255,255,0.95)";
  container.style.border = "1px solid #ddd";
  container.style.padding = "8px";
  container.style.borderRadius = "8px";
  container.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)";
  container.style.fontFamily = "sans-serif";
  container.style.fontSize = "13px";
  container.style.color = "#111";

  const status = document.createElement("div");
  status.id = containerId + "-status";
  status.style.marginBottom = "6px";
  status.innerText = "Conectando...";
  container.appendChild(status);

  const btn = document.createElement("button");
  btn.id = containerId + "-btn";
  btn.style.padding = "6px 10px";
  btn.style.border = "none";
  btn.style.borderRadius = "6px";
  btn.style.cursor = "pointer";
  btn.innerText = "Entrar com Google";
  container.appendChild(btn);

  btn.addEventListener("click", async () => {
    if (!currentUser) {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (e) {
        console.error("Login failed", e);
        alert("Falha no login: " + (e as Error).message);
      }
    } else {
      await signOut(auth);
    }
  });

  document.body.appendChild(container);
  return { status, btn };
}

export function initFirebaseSync() {
  patchLocalStorage();
  const ui = createAuthUI();
  onAuthStateChanged(auth, async (u) => {
    currentUser = u;
    if (ui) {
      const { status, btn } = ui;
      if (!u) {
        status.innerText = "Não autenticado";
        btn.innerText = "Entrar com Google";
      } else {
        status.innerText = "Conectado: " + (u.email || u.displayName || u.uid);
        btn.innerText = "Sair";
      }
    }
    if (u) {
      await loadUserLocalStorage(u.uid);
    }
  });
}

// Auto-init when module is imported
try {
  if (typeof window !== "undefined") {
    // Delay init slightly to avoid interfering with SSR/hydration
    setTimeout(() => {
      initFirebaseSync();
    }, 100);
  }
} catch (e) {
  console.error(e);
}
