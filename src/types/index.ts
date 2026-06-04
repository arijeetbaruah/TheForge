export type UserRole = "user" | "member" | "admin";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  discordId: string;
  role: UserRole;
}

export interface SheetItem {
  Category: string;
  ItemName: string;
  PriceAmount: number;
  PriceUnit: string;
}

export interface SheetEnchantment {
  Category: string;
  Name: string;
  Tier: string;
}

export interface SheetDataResponse {
  items: SheetItem[];
  enchantments: SheetEnchantment[];
}

export interface OrderPayload {
  taskId: string;
  discordId: string;
  character: string;
  category: string;
  baseItem: string;
  enchantment: string;
  providingBase: boolean;
  quantity: string;
}

export interface Order extends OrderPayload {
  assignee: string;
  status: "Pending" | "In Progress" | "Complete" | "Cancelled";
  submittedAt: string;
}
