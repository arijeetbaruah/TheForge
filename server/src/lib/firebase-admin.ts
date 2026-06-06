import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables in case they are not loaded yet
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL;

if (!admin.apps.length) {
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'CRITICAL: Firebase Admin credentials are not fully set in environment variables!\n' +
      'Please ensure you have created the .env file at the project root and configured:\n' +
      '- FIREBASE_PROJECT_ID\n' +
      '- FIREBASE_CLIENT_EMAIL\n' +
      '- FIREBASE_PRIVATE_KEY\n' +
      'Refer to .env.example for guidance.'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    databaseURL,
  });
  console.log('Firebase Admin SDK initialized successfully.');
}

export const adminAuth = admin.auth();
export const adminDb = admin.database();
export default admin;
