import { getDocsFromCache, getDocsFromServer } from "firebase/firestore";

//ดึงเวลาที่เซฟ Cahce ล่าสุดออกมาก่อน โดยที่เอาเวลาไปเก็บใน last
export async function loadCompetencies(q, key) {
  const last = Number(localStorage.getItem(key) || 0);

  //เช็คว่าครั้งที่เซฟล่าสุดมากกว่าเวลาที่กำหนดไหม ถ้ายังก็โหลดข้อมูลจาก Cache ก่อนจะได้ไม่เปลือง read quota
  if (Date.now() - last < TTL) {
    try {
      const snap = await getDocsFromCache(q);
      if (!snap.empty) {
        console.log("ดึงข้อมูล competencies จาก cache");
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.log("cache miss", e.code);
    }
  }

  const snap = await getDocsFromServer(q);
  localStorage.setItem(key, String(Date.now()));
  console.log("ดึงข้อมูล competencies จาก firebase");
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
