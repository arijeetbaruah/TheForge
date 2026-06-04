// In-memory Shared Database for Demo/Local Testing

export interface MockOrder {
  taskId: string;
  discordId: string;
  character: string;
  category: string;
  baseItem: string;
  enchantment: string;
  providingBase: boolean;
  quantity: string;
  assignee: string;
  status: "Pending" | "In Progress" | "Complete" | "Cancelled";
  submittedAt: string;
}

// Pre-populate with standard sample records
let mockOrders: MockOrder[] = [
  {
    taskId: "order-1",
    discordId: "aldric#1234",
    character: "Aldric the Bold",
    category: "Weapon",
    baseItem: "Steel Longsword",
    enchantment: "Flaming Edge",
    providingBase: false,
    quantity: "1",
    assignee: "Smithy John",
    status: "In Progress",
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    taskId: "order-2",
    discordId: "aldric#1234",
    character: "Aldric the Bold",
    category: "Armor",
    baseItem: "Plate Gauntlets",
    enchantment: "None",
    providingBase: true,
    quantity: "2",
    assignee: "",
    status: "Pending",
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    taskId: "order-3",
    discordId: "gandalf#9999",
    character: "Gandalf the Grey",
    category: "Weapon",
    baseItem: "Iron Sword",
    enchantment: "Thorns",
    providingBase: false,
    quantity: "1",
    assignee: "",
    status: "Pending",
    submittedAt: new Date(Date.now() - 1800000).toISOString(),
  }
];

export function getMockOrders(): MockOrder[] {
  return mockOrders;
}

export function addMockOrder(order: MockOrder) {
  mockOrders.push(order);
}

export function updateMockOrder(taskId: string, updates: Partial<MockOrder>): boolean {
  const idx = mockOrders.findIndex((o) => o.taskId === taskId);
  if (idx !== -1) {
    mockOrders[idx] = { ...mockOrders[idx], ...updates };
    return true;
  }
  return false;
}
