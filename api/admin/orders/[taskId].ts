import { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAuth } from "../../_lib/firebase-admin";
import { getMockOrders, updateMockOrder } from "../../_lib/mock-db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Spec: Access: admin only
  const decodedToken = await verifyAuth(req, res, ["admin"]);
  if (!decodedToken) return;

  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(455).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { taskId } = req.query;
  if (!taskId || typeof taskId !== "string") {
    return res.status(400).json({ error: "Missing or invalid Task ID." });
  }

  const { status, assignee } = req.body;
  if (status && !["Pending", "In Progress", "Complete", "Cancelled"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;

  if (!appsScriptUrl) {
    console.warn("APPS_SCRIPT_URL not defined. Updating order in memory-store fallback.");
    const order = getMockOrders().find((o) => o.taskId === taskId);
    if (!order) {
      return res.status(404).json({ error: "Commission not found in ledger." });
    }
    
    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (assignee !== undefined) updates.assignee = assignee;

    updateMockOrder(taskId, updates);
    return res.status(200).json({ success: true, taskId });
  }

  try {
    const updatePayload = {
      action: "updateOrder",
      taskId,
      status: status || "",
      assignee: assignee || "",
    };

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script responded with code: ${response.status}`);
    }

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Error updating order by admin:", error);
    return res.status(500).json({ error: "Failed to update order in spreadsheet." });
  }
}
