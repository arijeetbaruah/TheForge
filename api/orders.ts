import { VercelRequest, VercelResponse } from "@vercel/node";
import { firebaseAdmin, verifyAuth } from "./_lib/firebase-admin";
import { getMockOrders, addMockOrder } from "./_lib/mock-db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify token
  const decodedToken = await verifyAuth(req, res);
  if (!decodedToken) return;

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;

  if (req.method === "POST") {
    const { discordId, character, category, baseItem, enchantment, providingBase, quantity } = req.body;

    if (!discordId || !character || !category || !baseItem || !quantity) {
      return res.status(400).json({ error: "Missing required order fields." });
    }

    const taskId = crypto.randomUUID();

    // Spec: If user's submitted discordId differs from their claim, update their custom claims
    const currentDiscordId = decodedToken.discordId || "";
    if (discordId !== currentDiscordId) {
      try {
        await firebaseAdmin.auth().setCustomUserClaims(decodedToken.uid, {
          role: decodedToken.role || "user",
          discordId: discordId,
        });
        console.log(`Updated custom claims for user ${decodedToken.uid} with discordId: ${discordId}`);
      } catch (claimErr) {
        console.error("Failed to update user discordId custom claim:", claimErr);
      }
    }

    const orderPayload = {
      action: "addOrder",
      taskId,
      discordId,
      character,
      category,
      baseItem,
      enchantment: enchantment || "None",
      providingBase,
      quantity,
    };

    if (!appsScriptUrl) {
      console.warn("APPS_SCRIPT_URL not defined. Adding to memory-store fallback.");
      const newOrder = {
        taskId,
        discordId,
        character,
        category,
        baseItem,
        enchantment: enchantment || "None",
        providingBase,
        quantity,
        assignee: "",
        status: "Pending" as const,
        submittedAt: new Date().toISOString(),
      };
      addMockOrder(newOrder);
      return res.status(200).json({ success: true, taskId });
    }

    try {
      const response = await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script responded with code: ${response.status}`);
      }

      const result = await response.json();
      return res.status(200).json({ success: true, taskId: result.taskId || taskId });
    } catch (error: any) {
      console.error("Error submitting order to sheet:", error);
      return res.status(500).json({ error: "Could not write order into the spreadsheet." });
    }
  } 
  
  if (req.method === "GET") {
    // Spec: Fetches caller's own orders (filtered by Discord ID)
    // We grab the Discord ID from the decoded token claims
    const discordId = decodedToken.discordId || "";

    if (!discordId) {
      // If user hasn't set a discordId yet, they can't have orders matching their discordId
      return res.status(200).json({ orders: [] });
    }

    if (!appsScriptUrl) {
      console.warn("APPS_SCRIPT_URL not defined. Fetching from memory-store fallback.");
      const filtered = getMockOrders().filter(o => o.discordId === discordId);
      return res.status(200).json({ orders: filtered });
    }

    try {
      const response = await fetch(`${appsScriptUrl}?action=getOrders`);
      if (!response.ok) {
        throw new Error(`Google Apps Script responded with code: ${response.status}`);
      }
      const data = await response.json();
      const allOrders: any[] = data.orders || [];
      const userOrders = allOrders.filter(
        (o: any) => o.discordId && o.discordId.toLowerCase() === discordId.toLowerCase()
      );
      return res.status(200).json({ orders: userOrders });
    } catch (error: any) {
      console.error("Error fetching orders from sheet:", error);
      return res.status(500).json({ error: "Could not fetch orders from the spreadsheet." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(455).json({ error: `Method ${req.method} Not Allowed` });
}
