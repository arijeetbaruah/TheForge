import MundaneItem from "./Entity/MundaneItem.js";
import Currency, { unit } from "./Entity/Currency.js";
import Category from "./Entity/Category.js";
import Enchantment, { tier } from "./Entity/Enchantment.js";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzEzR4nVYIfeAnNQKBNC5CHh7-hBDZb0iWjmCVLSLRUEI-cWDd5Sl3Iv5ByWtEGiOF3JA/exec";

// Keys are the raw strings coming from the sheet
const CATEGORY_MAP = {
    "Weapon":     Category.weapon,
    "Armor":      Category.armor,
    "Consumable": Category.consumable,
    "Poison":     Category.poison,
};

const UNIT_MAP = {
    "pp": unit.pp,
    "gp": unit.gp,
    "sp": unit.sp,
    "cp": unit.cp,
};

const TIER_MAP = {
    "Tier1": tier.tier1,
    "Tier2": tier.tier2,
    "Tier3": tier.tier3,
};

function rowToMundaneItem(row) {
    const item     = new MundaneItem();
    item.Category  = CATEGORY_MAP[row.Category]  ?? Category.weapon;
    item.itemName  = row.ItemName                ?? "";
    item.price     = new Currency(
        Number(row.PriceAmount) || 0,
        UNIT_MAP[row.PriceUnit?.toLowerCase()] ?? unit.gp,
    );
    return item;
}

function rowToEnchantment(row) {
    const enchantment     = new Enchantment();
    enchantment.Category  = CATEGORY_MAP[row.Category] ?? Category.weapon;
    enchantment.name      = row.Name                   ?? "";
    enchantment.tier      = TIER_MAP[row.Tier]         ?? tier.tier1;
    return enchantment;
}

const SheetService = {
    async fetchAll() {
        const res = await fetch(APPS_SCRIPT_URL);

        if (!res.ok) {
            throw new Error(`SheetService: request failed — ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        return {
            items:        (data.items        ?? []).map(rowToMundaneItem),
            enchantments: (data.enchantments ?? []).map(rowToEnchantment),
        };
    },

    /**
     * Submits a commission order to the Orders sheet.
     * @param {{ taskId, discordId, character, category, baseItem, enchantment, providingBase, quantity }} order
     * @returns {Promise<{ success: boolean, taskId: string }>}
     */
    async submitOrder(order) {
        const res = await fetch(APPS_SCRIPT_URL, {
            method:  "POST",
            // text/plain avoids a CORS preflight — Apps Script requires this
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
                taskId:        order.taskId,
                discordId:     order.discordId,
                character:     order.character,
                category:      order.category?.label   ?? "",
                baseItem:      order.baseItem?.label    ?? "",
                enchantment:   order.enchantment?.label ?? "",
                quantity:      order.quantity,
                providingBase: order.providingBase      ?? false,
            }),
        });

        if (!res.ok) {
            throw new Error(`SheetService.submitOrder: request failed — ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        if (!data.success) {
            throw new Error(`SheetService.submitOrder: ${data.error}`);
        }

        return data;
    },
};

export default SheetService;