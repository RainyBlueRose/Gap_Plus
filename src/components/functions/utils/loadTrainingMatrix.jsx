import { getDocFromCache, getDocFromServer } from "firebase/firestore";

const TTL = 60 * 60 * 1000; //ค่าคือ 1 ชม : ตัวกำหนดอายุข้อมูลที่จะเก็บไว้แบบ offline ว่าให้อยู่ได้นานแค่ไหนถึงจะเกินจุดที่ควรอัปเดทข้อมูล ทำเพื่อประหยัด read quota

export async function loadTrainingMatrix(ref, key) {
  const last = Number(localStorage.getItem(key) || 0);

  if (Date.now() - last < TTL) {
    try {
      const snap = await getDocFromCache(ref);
      if (snap.exists()) {
        console.log("ดึงจาก cache");
        return snap.data();
      }
    } catch {}
  }

  const snap = await getDocFromServer(ref);
  localStorage.setItem(key, String(Date.now()));
  console.log("ดึงจาก Firebase");
  return snap.data();
}
