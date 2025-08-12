
import { useEffect, useState } from 'react';
import { listPrivateTours, listDailyTours } from '@/src/services/tours';

export default function ToursHub(){
  const [priv,setPriv]=useState<any[]>([]);
  const [daily,setDaily]=useState<any[]>([]);
  useEffect(()=>{ listPrivateTours().then(setPriv); listDailyTours().then(setDaily); },[]);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-3">Tours</h1>
      <h2 className="text-lg mt-2">Private</h2>
      <ul className="grid gap-2">{priv.map(t=>(<li key={t.id} className="border rounded p-2 bg-white">{t.name}</li>))}</ul>
      <h2 className="text-lg mt-4">Daily</h2>
      <ul className="grid gap-2">{daily.map(t=>(<li key={t.id} className="border rounded p-2 bg-white">{t.name}</li>))}</ul>
    </div>
  );
}
