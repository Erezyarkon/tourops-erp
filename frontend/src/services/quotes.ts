import { F } from './api';
export async function listQuotes(){ const r=await fetch(`${F}/quotes`); if(!r.ok) throw new Error('fail'); return r.json(); }
export async function getQuote(id:string){ const r=await fetch(`${F}/quotes?id=${id}`); if(!r.ok) throw new Error('fail'); return r.json(); }
export async function createQuote(body:any){ const r=await fetch(`${F}/quotes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); if(!r.ok) throw new Error('fail'); return r.json(); }
export async function updateQuote(body:any){ const r=await fetch(`${F}/quotes`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); if(!r.ok) throw new Error('fail'); return r.json(); }