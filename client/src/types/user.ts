export interface ForgeUser {
  uid: string;              // "discord:{discordId}"
  discordId: string;
  username: string;
  email: string | null;
  avatar: string | null;    // full CDN URL
  role: 'USER' | 'MEMBER' | 'ADMIN';
  createdAt: number;        // timestamp
  updatedAt: number;
}
