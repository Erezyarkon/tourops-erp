import { useMemo } from 'react';
type Row = { pax:number; buses:number; netPerPax:number; grossPerPax:number; netGroup:number; grossGroup:number };

export default function QuoteMatrix({ quote, items }:{ quote:any; items:any[] }){
  const sizes = [15,20,30,40,50];
  const rows = useMemo<Row[]>(()=>{
    if(!quote) return [];
    const cap = Number(quote.buses_capacity||50);
    const mt  = quote.markup_type || 'percent';
    const mv  = Number(quote.markup_value||0);
    return sizes.map(pax=>{
      const buses = Math.ceil(pax/(cap||50));
      const freeHotelPax = Math.floor(pax/20);
      const payingHotelPax = Math.max(pax - freeHotelPax, 0);
      let netGroup = 0;
      for(const it of items){
        const g = Number(it.cost_per_group||0);
        const p = Number(it.cost_per_person||0);
        if(it.service_type==='hotel'){ netGroup += g + p*payingHotelPax; }
        else { netGroup += g + p*pax; }
      }
      const netPerPax = netGroup/(pax||1);
      const markup = mt==='percent' ? netPerPax*(mv/100) : mv;
      const grossPerPax = netPerPax + markup;
      const grossGroup  = grossPerPax * pax;
      return { pax, buses, netPerPax, grossPerPax, netGroup, grossGroup };
    });
  }, [quote, items]);

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-[720px] border">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-2 border">PAX</th>
            <th className="p-2 border">Buses</th>
            <th className="p-2 border">Net / pax</th>
            <th className="p-2 border">Gross / pax</th>
            <th className="p-2 border">Net / group</th>
            <th className="p-2 border">Gross / group</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.pax}>
              <td className="p-2 border text-center">{r.pax}</td>
              <td className="p-2 border text-center">{r.buses}</td>
              <td className="p-2 border text-right">{r.netPerPax.toFixed(2)}</td>
              <td className="p-2 border text-right">{r.grossPerPax.toFixed(2)}</td>
              <td className="p-2 border text-right">{r.netGroup.toFixed(2)}</td>
              <td className="p-2 border text-right">{r.grossGroup.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs opacity-70 mt-1">* Hotels: 1 free pax per 20 paying (applies to per-person hotel costs).</div>
    </div>
  );
}