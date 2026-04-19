import {
  signInAnonymously as firebaseSignInAnonymously,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "./firebase";

export async function signInAnonymously() {
  await setPersistence(auth, browserLocalPersistence);
  return firebaseSignInAnonymously(auth);
}

export async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");
  return user.getIdToken();
}
