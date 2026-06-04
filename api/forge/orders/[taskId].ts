import { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAuth } from "../../_lib/firebase-admin";
import { getMockOrders, updateMockOrder } from "../../_lib/mock-db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Access: member, admin
  const decodedToken = await verifyAuth(req, res, ["member", "admin"]);
  if (!decodedToken) return;

  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(455).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { taskId } = req.query;
  if (!taskId || typeof taskId !== "string") {
    return res.status(400).json({ error: "Missing or invalid Task ID in request." });
  }

  const { action } = req.body;
  if (!action || !["claim", "complete"].includes(action)) {
    return res.status(400).json({ error: "Action must be 'claim' or 'complete'." });
  }

  // Get name of member who is taking action
  // If display_name is missing, we use email prefix
  const memberName = decodedToken.name || decodedToken.email?.split("@")[0] || "Noble Smith";
  const appsScriptUrl = process.env.APPS_SCRIPT_URL;

  // Let's implement the 'claim' stoking rules
  if (action === "claim") {
    // 1. Verify that this member doesn't already have an active (In Progress) order
    if (!appsScriptUrl) {
      const active = getMockOrders().find(
        (o) => o.status === "In Progress" && o.assignee === memberName
      );
      if (active) {
        return res.status(400).json({
          error: "Thy hands are full! Complete thy current forge task before claiming another.",
        });
      }
    } else {
      try {
        const response = await fetch(`${appsScriptUrl}?action=getOrders`);
        if (!response.ok) {
          throw new Error("Unable to retrieve spreadsheet orders list.");
        }
        const data = await response.json();
        const allOrders: any[] = data.orders || [];
        const active = allOrders.find(
          (o) => o.status === "In Progress" && o.assignee === memberName
        );
        if (active) {
          return res.status(400).json({
            error: "Thy hands are full! Complete thy current forge task before claiming another.",
          });
        }
      } catch (err: any) {
        console.error("Checking active orders in sheet failed:", err);
        return res.status(500).json({ error: "Failed to verify thy current workload from sheet." });
      }
    }

    // 2. Perform the update: status="In Progress", assignee=memberName
    if (!appsScriptUrl) {
      const order = getMockOrders().find((o) => o.taskId === taskId);
      if (!order) {
        return res.status(404).json({ error: "Commission not found in ledger." });
      }
      if (order.status !== "Pending") {
        return res.status(400).json({ error: "Commission has already been claimed by another." });
      }
      updateMockOrder(taskId, { status: "In Progress", assignee: memberName });
      return res.status(200).json({ success: true, taskId });
    } else {
      try {
        const updatePayload = {
          action: "updateOrder",
          taskId,
          status: "In Progress",
          assignee: memberName,
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
        console.error("Error claiming order in sheet:", error);
        return res.status(500).json({ error: "Failed to claim order in spreadsheet." });
      }
    }
  }

  // Complete action: status="Complete"
  if (action === "complete") {
    if (!appsScriptUrl) {
      const order = getMockOrders().find((o) => o.taskId === taskId);
      if (!order) {
        return res.status(404).json({ error: "Commission not found in ledger." });
      }
      if (order.assignee !== memberName && decodedToken.role !== "admin") {
        return res.status(403).json({ error: "This commission is not thine to finish!" });
      }
      updateMockOrder(taskId, { status: "Complete" });
      return res.status(200).json({ success: true, taskId });
    } else {
      try {
        // Retrieve current order to check assignee
        const ordersRes = await fetch(`${appsScriptUrl}?action=getOrders`);
        if (!ordersRes.ok) {
          throw new Error("Unable to retrieve spreadsheet orders list.");
        }
        const data = await ordersRes.json();
        const allOrders: any[] = data.orders || [];
        const order = allOrders.find((o) => o.taskId === taskId);

        if (!order) {
          return res.status(404).json({ error: "Commission not found in sheet." });
        }
        if (order.assignee !== memberName && decodedToken.role !== "admin") {
          return res.status(403).json({ error: "This commission is not thine to finish!" });
        }

        const updatePayload = {
          action: "updateOrder",
          taskId,
          status: "Complete",
          assignee: order.assignee, // preserve assignee
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
        console.error("Error completing order in sheet:", error);
        return res.status(500).json({ error: "Failed to complete order in spreadsheet." });
      }
    }
  }

  return res.status(400).json({ error: "Unrecognized action." });
}
