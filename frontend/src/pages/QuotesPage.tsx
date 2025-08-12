
import { useEffect, useState } from 'react';
import { listQuotes } from '@/src/services/quotes';
import { Link } from 'react-router-dom';

export default function QuotesPage(){
  const [items,setItems]=useState<any[]>([]);
  useEffect(()=>{ listQuotes().then(setItems); },[]);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-3">Quotes</h1>
      <Link to="/client-card" className="px-3 py-2 bg-blue-600 text-white rounded">New Quote</Link>
      <div className="mt-4 grid gap-2">
        {items.map(q=>(
          <Link key={q.id} to={`/quotes/${q.id}`} className="border rounded p-2 bg-white hover:bg-slate-50">
            <div className="font-medium">{q.title || '(no title)'}</div>
            <div className="text-xs opacity-70">{q.customers?.name} • {q.group_size} pax</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
