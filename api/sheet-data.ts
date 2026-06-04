import { VercelRequest, VercelResponse } from "@vercel/node";
import _ from 'underscore'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(455).json({ error: `Method ${req.method} Not Allowed` });
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  if (!appsScriptUrl) {
    console.warn("APPS_SCRIPT_URL is not set. Returning template/mock data for testing.");
    // Fallback Mock Data matching sheet structure
    return res.status(200).json({
      items: [
        { Category: "Weapon", ItemName: "Iron Sword", PriceAmount: 15, PriceUnit: "gp" },
        { Category: "Weapon", ItemName: "Steel Longsword", PriceAmount: 50, PriceUnit: "gp" },
        { Category: "Armor", ItemName: "Chainmail Chestplate", PriceAmount: 75, PriceUnit: "gp" },
        { Category: "Armor", ItemName: "Plate Gauntlets", PriceAmount: 40, PriceUnit: "gp" },
        { Category: "Poison", ItemName: "Manticore Venom", PriceAmount: 100, PriceUnit: "gp" },
        { Category: "Poison", ItemName: "Sleep Powder", PriceAmount: 30, PriceUnit: "gp" },
        { Category: "Consumable", ItemName: "Health Elixir", PriceAmount: 25, PriceUnit: "gp" },
        { Category: "Consumable", ItemName: "Dwarven Stout", PriceAmount: 5, PriceUnit: "gp" },
      ],
      enchantments: [
        { Category: "Weapon", Name: "Flaming Edge", Tier: "2" },
        { Category: "Weapon", Name: "Vampiric Touch", Tier: "3" },
        { Category: "Armor", Name: "Iron Will", Tier: "1" },
        { Category: "Armor", Name: "Thorns", Tier: "2" },
        { Category: "Poison", Name: "Concentrated Potency", Tier: "1" },
        { Category: "Consumable", Name: "Double Duration", Tier: "2" },
      ],
    });
  }

  const tierCost:Record<string, { PriceAmount: number; PriceUnit: string }> = {
    "1": { PriceAmount: 200, PriceUnit: "gp" },
    "2": { PriceAmount: 400, PriceUnit: "gp" },
    "3": { PriceAmount: 600, PriceUnit: "gp" },
  }

  try {
    const response = await fetch(appsScriptUrl);
    if (!response.ok) {
      throw new Error(`Google Apps Script responded with code: ${response.status}`);
    }
    const data = await response.json();
    data.enchantments = _.map(data.enchantments, enchantment => {
      const cost = tierCost[enchantment.Tier];
      enchantment.PriceAmount = cost.PriceAmount;
      enchantment.PriceUnit = cost.PriceUnit;

      return enchantment;
    });
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error calling Apps Script GET:", error);
    return res.status(500).json({ error: "Failed to retrieve forge blueprints from Google Sheets." });
  }
}
