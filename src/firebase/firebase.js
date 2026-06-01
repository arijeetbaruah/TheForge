import { initializeApp } from "firebase/app";

let localConfig = {};

if (import.meta.env.DEV) {
    try {
        const mod = await import('../../en.local.json');
        localConfig = mod.default;
    } catch {
        console.log('en.local.json not found, using env vars');
    }
}

const get = (envKey, localKey) =>
    import.meta.env[envKey] || localConfig[localKey] || '';

const firebaseConfig = {
    apiKey:            get('VITE_FIREBASE_API_KEY',            'apiKey'),
    authDomain:        get('VITE_FIREBASE_AUTH_DOMAIN',        'authDomain'),
    projectId:         get('VITE_FIREBASE_PROJECT_ID',         'projectId'),
    storageBucket:     get('VITE_FIREBASE_STORAGE_BUCKET',     'storageBucket'),
    messagingSenderId: get('VITE_FIREBASE_MESSAGING_SENDER_ID','messagingSenderId'),
    appId:             get('VITE_FIREBASE_APP_ID',             'appId'),
    databaseURL:       get('VITE_FIREBASE_DATABASE_URL',       'databaseURL'),
};

const app = initializeApp(firebaseConfig);

export default app;