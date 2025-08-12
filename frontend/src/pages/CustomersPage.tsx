
import { useEffect, useState } from 'react';
import { listCustomers, createCustomer } from '@/src/services/clients';
import { useNavigate } from 'react-router-dom';

export default function CustomersPage(){
  const nav = useNavigate();
  const [items,setItems]=useState<any[]>([]);
  const [name,setName]=useState('');
  useEffect(()=>{ listCustomers().then(setItems); },[]);
  async function add(){
    const c = await createCustomer({ name });
    setItems([c, ...items]); setName('');
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-3">Customers</h1>
      <div className="flex gap-2 mb-4">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Customer name" className="border rounded px-2 py-1"/>
        <button onClick={add} className="px-3 py-1 rounded bg-blue-600 text-white">Add</button>
        <button onClick={()=>nav('/client-card')} className="px-3 py-1 rounded border">Open Client Card</button>
      </div>
      <ul className="grid gap-2">
        {items.map(c=>(<li key={c.id} className="border rounded p-2 bg-white">{c.name}</li>))}
      </ul>
    </div>
  );
}
