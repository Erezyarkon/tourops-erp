import { F } from './api';
export async function listPrivateTours(){ const r=await fetch(`${F}/tours-private`); if(!r.ok) throw new Error('fail'); return r.json(); }
export async function listDailyTours(){ const r=await fetch(`${F}/tours-daily`); if(!r.ok) throw new Error('fail'); return r.json(); }