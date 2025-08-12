import { F } from './api';
export async function listCustomers(){ const r=await fetch(`${F}/clients`); if(!r.ok) throw new Error('fail'); return r.json(); }
export async function createCustomer(body:any){ const r=await fetch(`${F}/clients`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); if(!r.ok) throw new Error('fail'); return r.json(); }