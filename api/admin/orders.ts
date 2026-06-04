import { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAuth } from "../_lib/firebase-admin";
import { getMockOrders } from "../_lib/mock-db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Spec: Access: admin only
  const decodedToken = await verifyAuth(req, res, ["admin"]);
  if (!decodedToken) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(455).json({ error: `Method ${req.method} Not Allowed` });
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;

  if (!appsScriptUrl) {
    console.warn("APPS_SCRIPT_URL not defined. Fetching all orders from memory-store fallback.");
    return res.status(200).json({ orders: getMockOrders() });
  }

  try {
    const response = await fetch(`${appsScriptUrl}?action=getOrders`);
    if (!response.ok) {
      throw new Error(`Google Apps Script responded with code: ${response.status}`);
    }
    const data = await response.json();
    return res.status(200).json({ orders: data.orders || [] });
  } catch (error: any) {
    console.error("Error fetching all orders for admin:", error);
    return res.status(500).json({ error: "Could not fetch all orders from spreadsheet." });
  }
}
