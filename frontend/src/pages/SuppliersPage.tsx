
import { useEffect, useState } from 'react';
import { listSuppliers, upsertSupplier, deleteSupplier } from '@/src/services/suppliers';

const CATS = ['hotel','bus','car_rental','tour','attraction','meal','addon','flight','transfer'];

export default function SuppliersPage(){
  const [cat,setCat]=useState<string>('');
  const [items,setItems]=useState<any[]>([]);
  const [form,setForm]=useState<any>({ name:'', category:'hotel' });

  async function load(){ setItems(await listSuppliers(cat||undefined)); }
  useEffect(()=>{ load(); },[cat]);

  async function save(){
    const s = await upsertSupplier(form);
    setForm({ name:'', category:'hotel' });
    load();
  }
  async function del(id:string){ await deleteSupplier(id); load(); }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-3">Suppliers</h1>
      <div className="flex gap-2 mb-4">
        <select value={cat} onChange={e=>setCat(e.target.value)} className="border rounded px-2 py-1">
          <option value="">All</option>
          {CATS.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Supplier name" className="border rounded px-2 py-1"/>
        <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="border rounded px-2 py-1">
          {CATS.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={save} className="px-3 py-1 rounded bg-blue-600 text-white">Save</button>
      </div>
      <ul className="grid gap-2">
        {items.map(s=>(
          <li key={s.id} className="border rounded p-2 bg-white flex justify-between items-center">
            <div>{s.name} <span className="opacity-60">({s.category})</span></div>
            <button onClick={()=>del(s.id)} className="text-red-600 border rounded px-2 py-1">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
