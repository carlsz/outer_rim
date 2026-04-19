import * as admin from "firebase-admin";

let initialized = false;

function initAdmin() {
  if (initialized || admin.apps.length > 0) return;

  const credentialBase64 = process.env.FIREBASE_ADMIN_CREDENTIAL;
  if (!credentialBase64) {
    throw new Error("FIREBASE_ADMIN_CREDENTIAL is not set");
  }

  const serviceAccount = JSON.parse(
    Buffer.from(credentialBase64, "base64").toString("utf-8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
}

export function getAdminDb(): admin.firestore.Firestore {
  initAdmin();
  return admin.firestore();
}

export async function verifyAuthToken(req: Request): Promise<string> {
  initAdmin();
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Response("Unauthorized", { status: 401 });
  }
  const token = authHeader.slice(7);
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded.uid;
}

export { admin };
