
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomer } from '@/src/services/clients';
import { createQuote } from '@/src/services/quotes';

export default function ClientCard(){
  const nav = useNavigate();
  const [customer,setCustomer]=useState({ name:'', email:'', phone:'' });
  const [quote,setQuote]=useState({ title:'', destination:'', start_date:'', end_date:'', group_size:20, buses_capacity:50, markup_type:'percent', markup_value:10, language:'en' });
  const [loading,setLoading]=useState(false);

  async function submit(){
    setLoading(true);
    try{
      const created = await createCustomer(customer);
      const q = await createQuote({ ...quote, customer_id: created.id });
      nav(`/quotes/${q.id}`);
    } finally { setLoading(false); }
  }

  return (
    <div className="p-6 grid gap-3 max-w-3xl">
      <h1 className="text-2xl font-semibold">Client Card</h1>
      <input placeholder="Customer name" value={customer.name} onChange={e=>setCustomer(s=>({...s,name:e.target.value}))}/>
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Email" value={customer.email||''} onChange={e=>setCustomer(s=>({...s,email:e.target.value}))}/>
        <input placeholder="Phone" value={customer.phone||''} onChange={e=>setCustomer(s=>({...s,phone:e.target.value}))}/>
      </div>
      <h2 className="text-xl mt-4">Quote</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <input placeholder="Title" value={quote.title||''} onChange={e=>setQuote(s=>({...s,title:e.target.value}))}/>
        <input placeholder="Destination" value={quote.destination||''} onChange={e=>setQuote(s=>({...s,destination:e.target.value}))}/>
        <input type="date" value={quote.start_date||''} onChange={e=>setQuote(s=>({...s,start_date:e.target.value}))}/>
        <input type="date" value={quote.end_date||''} onChange={e=>setQuote(s=>({...s,end_date:e.target.value}))}/>
        <input type="number" value={quote.group_size} onChange={e=>setQuote(s=>({...s,group_size:Number(e.target.value)}))} placeholder="Group size"/>
        <input type="number" value={quote.buses_capacity} onChange={e=>setQuote(s=>({...s,buses_capacity:Number(e.target.value)}))} placeholder="Bus capacity"/>
        <select value={quote.markup_type} onChange={e=>setQuote(s=>({...s,markup_type:e.target.value as any}))}>
          <option value="percent">Markup %</option>
          <option value="amount">Markup amount</option>
        </select>
        <input type="number" value={quote.markup_value} onChange={e=>setQuote(s=>({...s,markup_value:Number(e.target.value)}))} placeholder="Markup value"/>
      </div>
      <button disabled={loading} onClick={submit} className="px-4 py-2 rounded bg-blue-600 text-white w-fit">Continue</button>
    </div>
  );
}
