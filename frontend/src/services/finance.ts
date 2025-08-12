import { F } from './api';
export async function listInvoices(){ const r=await fetch(`${F}/finance?r=invoices`); if(!r.ok) throw new Error('fail'); return r.json(); }
export async function listPayments(){ const r=await fetch(`${F}/finance?r=payments`); if(!r.ok) throw new Error('fail'); return r.json(); }