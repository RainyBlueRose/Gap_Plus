import { clearIndexedDbPersistence, terminate } from "firebase/firestore";
import { db } from "../../config/firebase";

export const deleteCacheIndexDB = async () => {
  await terminate(db);
  await clearIndexedDbPersistence(db);
};
