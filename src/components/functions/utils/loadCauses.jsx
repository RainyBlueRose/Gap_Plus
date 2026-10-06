import React from "react";

import { getDocFromCache, getDocsFromServer } from "firebase/firestore";

const TTL = 24 * 60 * 60 * 1000; // 1 วัน

export async function loadCauses(q, uid) {
  const key = `coursesAt:${uid}`;
  const last = Number(localStorage.getItem(key) || 0);

  if (Date.now() - last < TTL) {
    try {
      const snap = await getDocFromCache(q);
      if (!snap.empty) return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch {}
  }

  const snap = await getDocsFromServer(q);
  localStorage.setItem(key, String(Date.now()));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
