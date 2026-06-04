import { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAuth } from "../_lib/firebase-admin";
import { getMockOrders } from "../_lib/mock-db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Spec: Access: member, admin
  const decodedToken = await verifyAuth(req, res, ["member", "admin"]);
  if (!decodedToken) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(455).json({ error: `Method ${req.method} Not Allowed` });
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;

  if (!appsScriptUrl) {
    console.warn("APPS_SCRIPT_URL not defined. Fetching queue from memory-store fallback.");
    const allMock = getMockOrders();
    // Return both Pending and In Progress orders in the queue so they can claim or complete
    const filtered = allMock.filter(
      (o) => o.status === "Pending" || o.status === "In Progress"
    );
    return res.status(200).json({ orders: filtered });
  }

  try {
    const response = await fetch(`${appsScriptUrl}?action=getOrders`);
    if (!response.ok) {
      throw new Error(`Google Apps Script responded with code: ${response.status}`);
    }
    const data = await response.json();
    const allOrders: any[] = data.orders || [];
    // Filter down to only active/pending orders in the forge queue
    const activeOrders = allOrders.filter(
      (o) => o.status === "Pending" || o.status === "In Progress"
    );
    return res.status(200).json({ orders: activeOrders });
  } catch (error: any) {
    console.error("Error fetching forge queue orders:", error);
    return res.status(500).json({ error: "Could not fetch forge queue from the spreadsheet." });
  }
}
