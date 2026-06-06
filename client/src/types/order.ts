export type OrderStatus =
  | 'PENDING'       // submitted, awaiting admin review
  | 'ACCEPTED'      // admin accepted, work not started
  | 'IN_PROGRESS'   // being crafted
  | 'READY'         // ready for delivery
  | 'COMPLETED'     // delivered and closed
  | 'REJECTED';     // declined with reason

export type Category =
  | 'WEAPON'
  | 'ARMOUR'
  | 'POTION'
  | 'SCROLL'
  | 'JEWELLERY'
  | 'OTHER';

export interface Order {
  id: string;
  discordUsername: string;
  category: Category;
  character: string;
  enchantment: string;
  quantity: number;
  baseItem: string;
  specialRequests: string | null;
  providingBaseItem: boolean;
  status: OrderStatus;
  adminNote: string | null;     // shown to user (e.g. rejection reason)
  internalNote: string | null;  // admin-only note
  createdAt: number;
  updatedAt: number;
}

export interface CreateOrderInput {
  discordId: string;
  character: string;
  category: 'Weapon' | 'Armor' | 'Consumable' | 'Poison';
  baseItem: string;
  enchantment: string;
  quantity: number;
  providingBaseItem: boolean;
  specialRequests: string | null;
}
