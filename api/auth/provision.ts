import { VercelRequest, VercelResponse } from "@vercel/node";
import { firebaseAdmin, verifyAuth } from "../_lib/firebase-admin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(455).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Verify authorization token
  const decodedToken = await verifyAuth(req, res);
  if (!decodedToken) return; // verifyAuth handles error response

  const uid = decodedToken.uid;

  try {
    const auth = firebaseAdmin.auth();
    const userRecord = await auth.getUser(uid);

    // If role is already set, do not overwrite to preserve roles
    const currentClaims = userRecord.customClaims || {};
    if (currentClaims.role) {
      return res.status(200).json({
        success: true,
        message: "User is already registered in the guild.",
        role: currentClaims.role,
        discordId: currentClaims.discordId || "",
      });
    }

    // Provision new user as 'user' role with empty 'discordId'
    const newClaims = {
      role: "user",
      discordId: "",
    };

    await auth.setCustomUserClaims(uid, newClaims);

    console.log(`Successfully provisioned user ${uid} as 'user' role.`);
    return res.status(200).json({
      success: true,
      message: "User provisioned successfully in the guild ledger.",
      role: "user",
      discordId: "",
    });
  } catch (error: any) {
    console.error("Provisioning error:", error);
    return res.status(500).json({ error: "Failed to sign the guild rolls." });
  }
}
