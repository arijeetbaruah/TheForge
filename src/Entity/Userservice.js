import { ref, get, set } from "firebase/database";
import { getDb } from "../firebase/realtimeDB.js";
import userRole from "./UserRole.js";

import { generateUsername } from 'unique-username-generator'

const UserService = {
    /**
     * Fetch a single user record by UID.
     * @param {string} uid
     * @returns {Promise<{ uid: string, role: string } | null>}
     */
    async getUser(uid) {
        const db       = await getDb();
        const snapshot = await get(ref(db, `users/${uid}`));
        if (!snapshot.exists()) return null;
        return { uid, ...snapshot.val() };
    },

    /**
     * Create a user record on first sign-in with a default role of 'user'.
     * Safe to call every login — only writes if the record doesn't exist yet.
     * @param {string} uid
     */
    async initUser(uid) {
        const db       = await getDb();
        const snapshot = await get(ref(db, `users/${uid}`));
        if (!snapshot.exists()) {
            const userName = generateUsername("-", 3, 20)
            await set(ref(db, `users/${uid}`), { role: userRole.User, userName: userName });
        }
    },

    async getUsers() {
        const db       = await getDb();
        const snapshot = await get(ref(db, `users`));
        if (!snapshot.exists()) return [];
        return Object.entries(snapshot.val()).map(([uid, data]) => ({ uid, ...data }));
    },
};

export default UserService;
