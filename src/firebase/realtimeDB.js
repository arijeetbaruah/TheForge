import { getDatabase  } from "firebase/database";
import app from "./firebase.js";

export const getDb = () => getDatabase(app);
