export enum OrderStatus {
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
}

export type Category =
  | 'WEAPON'
  | 'ARMOUR'
  | 'POTION'
  | 'SCROLL'
  | 'JEWELLERY'
  | 'OTHER';

/*taskId: order.OrderId,
      discordId: order.DiscordId,
      character: order.Character,
      category: order.Category,
      baseItem: order.Item,
      enchantment: order.Enchantment,
      quantity: order.Quantity,
      providingBase: order.ProvidingBase,
      specialRequests: '',
      status: order.Status.toUpperCase(),
      adminNote: null,
      internalNote: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
* */

export interface OrderDetail {
  id: string;
  discordId: string;
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

export interface Order {
  taskId: string;
  discordId: string;
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
  assignee: string | null;
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
