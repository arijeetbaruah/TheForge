import { initializeApp } from "firebase/app";

import _ from "underscore"

let config = {};

if (import.meta.env.DEV) {
    try {
        config = await import('../../en.local.json');
        config = config.default;
    } catch {
        console.log('en.local.json not found');
    }
}

// Replace these values with your Firebase project config
// Firebase Console → Project Settings → Your apps → SDK setup
const firebaseConfig = {
    apiKey:            _.isEmpty(import.meta.env.FIREBASE_API_KEY) ? config.apiKey : import.meta.env.FIREBASE_API_KEY,
    authDomain:        _.isEmpty(import.meta.env.FIREBASE_AUTH_DOMAIN) ? config.authDomain : import.meta.env.FIREBASE_AUTH_DOMAIN,
    projectId:         _.isEmpty(import.meta.env.FIREBASE_PROJECT_ID) ? config.projectId : import.meta.env.FIREBASE_PROJECT_ID,
    storageBucket:     _.isEmpty(import.meta.env.FIREBASE_STORAGE_BUCKET) ? config.storageBucket : import.meta.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: _.isEmpty(import.meta.env.FIREBASE_MESSAGING_SENDER_ID) ? config.messagingSenderId : import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
    appId:             _.isEmpty(import.meta.env.FIREBASE_APP_ID) ? config.appId : import.meta.env.FIREBASE_APP_ID,
};

const app            = initializeApp(firebaseConfig);

export default app;
