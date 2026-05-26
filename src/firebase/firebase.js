import { initializeApp } from "firebase/app";

console.log(import.meta.env.FIREBASE_API_KEY)
// Replace these values with your Firebase project config
// Firebase Console → Project Settings → Your apps → SDK setup
const firebaseConfig = {

    apiKey: "AIzaSyCr5HJx5OTS-wACLq-iuXzspeDw466QyUI",

    authDomain: "forge-order-form.firebaseapp.com",

    projectId: "forge-order-form",

    storageBucket: "forge-order-form.firebasestorage.app",

    messagingSenderId: "367321711778",

    appId: "1:367321711778:web:b1acd7e02c8c15a08b03fb",

    measurementId: "G-S56JMVNFZX"

};

const app            = initializeApp(firebaseConfig);

export default app;
