import { Router, Response, Request } from 'express';
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SheetDataItem {
    Category: string;
    ItemName: string;
    PriceAmount: number;
    PriceUnit: string;
}

interface SheetDataEnchantment {
    Category: string;
    Name: string;
    Tier: string;
    PriceAmount: number;
    PriceUnit: string;
}

interface SheetDataResponse {
    items: SheetDataItem[];
    enchantments: SheetDataEnchantment[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_COST: Record<string, { PriceAmount: number; PriceUnit: string }> = {
    '1': { PriceAmount: 200, PriceUnit: 'gp' },
    '2': { PriceAmount: 400, PriceUnit: 'gp' },
    '3': { PriceAmount: 600, PriceUnit: 'gp' },
};

const MOCK_DATA: SheetDataResponse = {
    items: [
        { Category: 'Weapon',     ItemName: 'Iron Sword',          PriceAmount: 15,  PriceUnit: 'gp' },
        { Category: 'Weapon',     ItemName: 'Steel Longsword',     PriceAmount: 50,  PriceUnit: 'gp' },
        { Category: 'Armour',     ItemName: 'Chainmail Chestplate',PriceAmount: 75,  PriceUnit: 'gp' },
        { Category: 'Armour',     ItemName: 'Plate Gauntlets',     PriceAmount: 40,  PriceUnit: 'gp' },
        { Category: 'Poison',     ItemName: 'Manticore Venom',     PriceAmount: 100, PriceUnit: 'gp' },
        { Category: 'Poison',     ItemName: 'Sleep Powder',        PriceAmount: 30,  PriceUnit: 'gp' },
        { Category: 'Consumable', ItemName: 'Health Elixir',       PriceAmount: 25,  PriceUnit: 'gp' },
        { Category: 'Consumable', ItemName: 'Dwarven Stout',       PriceAmount: 5,   PriceUnit: 'gp' },
    ],
    enchantments: [
        { Category: 'Weapon',     Name: 'Flaming Edge',          Tier: '2', PriceAmount: 400, PriceUnit: 'gp' },
        { Category: 'Weapon',     Name: 'Vampiric Touch',        Tier: '3', PriceAmount: 600, PriceUnit: 'gp' },
        { Category: 'Armour',     Name: 'Iron Will',             Tier: '1', PriceAmount: 200, PriceUnit: 'gp' },
        { Category: 'Armour',     Name: 'Thorns',                Tier: '2', PriceAmount: 400, PriceUnit: 'gp' },
        { Category: 'Poison',     Name: 'Concentrated Potency',  Tier: '1', PriceAmount: 200, PriceUnit: 'gp' },
        { Category: 'Consumable', Name: 'Double Duration',       Tier: '2', PriceAmount: 400, PriceUnit: 'gp' },
    ],
};

// ─── Route Handler ────────────────────────────────────────────────────────────

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
        console.warn('APPS_SCRIPT_URL not set — returning mock data.');
        return res.status(200).json(MOCK_DATA);
    }

    try {
        const response = await axios.get(appsScriptUrl, {
            params: { type: "SHEETDATA" }
        });

        if (response.status != 200) {
            throw new Error(`Apps Script responded with status ${response.status}`);
        }

        const data: SheetDataResponse = await response.data as SheetDataResponse;

        // Attach tier pricing to each enchantment
        data.enchantments = data.enchantments.map((enchantment) => {
            const cost = TIER_COST[enchantment.Tier];
            if (!cost) {
                console.warn(`Unknown enchantment tier "${enchantment.Tier}" for "${enchantment.Name}" — skipping price.`);
                return enchantment;
            }
            return { ...enchantment, ...cost };
        });

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching from Apps Script:', error);
        return res.status(500).json({ error: 'Failed to retrieve forge blueprints from Google Sheets.' });
    }
});

export default router;
