
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuote, updateQuote } from '@/src/services/quotes';
import { listSuppliers } from '@/src/services/suppliers';
import { listQuoteItems, addQuoteItem, deleteQuoteItem } from '@/src/services/quoteItems';
import QuoteMatrix from '@/src/components/quotes/QuoteMatrix';
import { PDFDownloadLink } from '@react-pdf/renderer';
import QuotePDFDoc from '@/src/components/pdf/QuotePDFDoc';
import { createBookingFromQuote } from '@/src/services/booking';

const CATS = ['hotel','bus','car_rental','tour','attraction','meal','addon'];

export default function QuoteBuilderPage(){
  const { id } = useParams();
  const [quote,setQuote]=useState<any>(null);
  const [tab,setTab]=useState('hotel');
  const [suppliers,setSuppliers]=useState<any[]>([]);
  const [items,setItems]=useState<any[]>([]);
  const [form,setForm]=useState<any>({ supplier_id:'', title:'', cost_per_person:'', cost_per_group:'' });
  const [lang,setLang]=useState<'en'|'he'>('en');

  useEffect(()=>{
    if(!id) return;
    getQuote(id).then(setQuote);
    listQuoteItems(id).then(setItems);
  },[id]);

  useEffect(()=>{ listSuppliers(tab).then(setSuppliers); },[tab]);

  async function addItem(){
    if(!id) return;
    const payload = {
      quote_id: id, supplier_id: form.supplier_id||null, service_type: tab, title: form.title||'',
      cost_per_person: form.cost_per_person? Number(form.cost_per_person): null,
      cost_per_group: form.cost_per_group? Number(form.cost_per_group): null
    };
    const created = await addQuoteItem(payload);
    setItems(prev=>[...prev, created]);
    setForm({ supplier_id:'', title:'', cost_per_person:'', cost_per_group:'' });
  }
  async function removeItem(itemId:string){ await deleteQuoteItem(itemId); setItems(prev=>prev.filter(x=>x.id!==itemId)); }
  async function toBooking(){ if(!id) return; const r = await createBookingFromQuote(id); alert('Booking: '+r.bookingId); }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">Quote Builder</h1>
        <div className="flex gap-2">
          <select value={lang} onChange={e=>setLang(e.target.value as any)} className="border rounded px-2 py-1">
            <option value="en">EN</option>
            <option value="he">HE</option>
          </select>
          {quote && <PDFDownloadLink document={<QuotePDFDoc quote={quote} items={items} lang={lang}/>} fileName={`quote-${quote.id}-${lang}.pdf`}>
            {({loading})=><button className="px-3 py-2 rounded border">{loading?'Generating…':'Generate PDF'}</button>}
          </PDFDownloadLink>}
          <button className="px-3 py-2 rounded bg-emerald-600 text-white" onClick={toBooking}>Create Booking</button>
        </div>
      </div>

      {quote && (<div className="mb-4 text-sm opacity-80">Client: {quote.customers?.name} • Group: {quote.group_size} • Dates: {quote.start_date||'-'} → {quote.end_date||'-'}</div>)}

      <div className="flex gap-2 mb-4 flex-wrap">
        {CATS.map(c=>(<button key={c} className={`px-3 py-1 rounded border ${tab===c?'bg-blue-600 text-white':'bg-white'}`} onClick={()=>setTab(c)}>{c}</button>))}
      </div>

      <div className="grid md:grid-cols-5 gap-2 mb-3">
        <select value={form.supplier_id} onChange={e=>setForm(f=>({...f,supplier_id:e.target.value}))} className="border rounded px-2 py-1">
          <option value="">Select supplier</option>
          {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input placeholder="Title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} className="border rounded px-2 py-1"/>
        <input type="number" placeholder="Cost / person" value={form.cost_per_person} onChange={e=>setForm(f=>({...f,cost_per_person:e.target.value}))} className="border rounded px-2 py-1"/>
        <input type="number" placeholder="Cost / group" value={form.cost_per_group} onChange={e=>setForm(f=>({...f,cost_per_group:e.target.value}))} className="border rounded px-2 py-1"/>
        <button onClick={addItem} className="px-3 py-2 rounded bg-emerald-600 text-white">Add</button>
      </div>

      <div className="grid gap-2">
        {items.filter(it=>it.service_type===tab).map(it=>(
          <div key={it.id} className="flex items-center justify-between border rounded p-2 bg-white">
            <div>
              <div className="font-medium">{it.suppliers?.name?`${it.suppliers.name} • `:''}{it.title||'(no title)'}</div>
              <div className="text-xs opacity-70">{it.cost_per_person?`Per pax: ${it.cost_per_person}`:''}{it.cost_per_group?`  Group: ${it.cost_per_group}`:''}</div>
            </div>
            <button className="px-2 border rounded text-red-600" onClick={()=>removeItem(it.id)}>Delete</button>
          </div>
        ))}
      </div>

      {quote && <QuoteMatrix quote={quote} items={items} />}
    </div>
  );
}
