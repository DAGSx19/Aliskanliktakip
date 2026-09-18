import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// 1) Firebase Console > Project Settings > General > "Your apps" > Web app
//    kısmından bu değerleri kopyala ve buraya yapıştır (veya .env dosyasına koy).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// Kullanıcı adı/şifre istemiyoruz: anonim oturum açılır, Firebase bu kimliği
// tarayıcıda saklar, böylece veriler sıfırlanmadan kalıcı olur.
export function ensureSignedIn(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user.uid);
    } else {
      signInAnonymously(auth).catch((err) => {
        console.error("Anonim giriş başarısız:", err);
      });
    }
  });
}
