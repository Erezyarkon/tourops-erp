
import { useEffect, useState } from 'react';
import { listInvoices, listPayments } from '@/src/services/finance';

export default function FinancePage(){
  const [invoices,setInvoices]=useState<any[]>([]);
  const [payments,setPayments]=useState<any[]>([]);
  useEffect(()=>{ listInvoices().then(setInvoices); listPayments().then(setPayments); },[]);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Finance</h1>
      <h2 className="text-lg mt-3">Invoices</h2>
      <ul className="grid gap-2">{invoices.map(i=>(<li key={i.id} className="border rounded p-2 bg-white">{i.number||'(no number)'} • {i.total||0} {i.currency}</li>))}</ul>
      <h2 className="text-lg mt-3">Payments</h2>
      <ul className="grid gap-2">{payments.map(p=>(<li key={p.id} className="border rounded p-2 bg-white">{p.amount||0} {p.currency} • {p.method||'-'}</li>))}</ul>
    </div>
  );
}
