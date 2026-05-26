import { getAnalytics } from "firebase/analytics";
import app from "./firebase.js";

export const analytics = getAnalytics(app);