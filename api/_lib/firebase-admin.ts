import * as admin from "firebase-admin";
import { VercelRequest, VercelResponse } from "@vercel/node";

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    console.warn("WARNING: FIREBASE_ADMIN_SERVICE_ACCOUNT environment variable is not defined.");
  } else {
    try {
      // In some environments, the service account JSON might be escaped or single-quoted.
      // We parse it safely.
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin initialized successfully.");
    } catch (error) {
      console.error("Firebase Admin initialization failed:", error);
    }
  }
}

export const firebaseAdmin = admin;

export interface AuthenticatedRequest extends VercelRequest {
  user?: admin.auth.DecodedIdToken;
}

export async function verifyAuth(
  req: VercelRequest,
  res: VercelResponse,
  allowedRoles?: string[]
): Promise<admin.auth.DecodedIdToken | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization token. Forge entrance denied." });
    return null;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = decodedToken.role || "user";
      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({ error: "Forbidden: insufficient guild permissions." });
        return null;
      }
    }

    return decodedToken;
  } catch (error) {
    console.error("Auth token verification failed:", error);
    res.status(401).json({ error: "Unauthorized guild token." });
    return null;
  }
}
