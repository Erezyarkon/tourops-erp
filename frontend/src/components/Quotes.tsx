import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";

type Quote = {
  id?: string; quote_number?: string; group_name?: string; destination?: string;
  start_date?: string; end_date?: string; group_size?: number;
  markup_type?: "percent"|"fixed"; markup_value?: number;
  final_price_total?: number; final_price_per_person?: number;
}
type QuoteItem = {
  id?: string; quote_id?: string; service_type?: string; item_name?: string;
  cost_per_person?: number|null; cost_per_group?: number|null; pricing_type?: "per_pax"|"per_group";
  quantity?: number|null;
}
export function Quotes(){
  const { t } = useTranslation();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [active, setActive] = useState<Quote|undefined>(undefined);
  const [items, setItems] = useState<QuoteItem[]>([]);
  async function load(){
    const { data } = await supabase.from("quotes").select("*").order("created_at", { ascending:false });
    setQuotes(data||[]);
    if((data||[]).length) selectQuote((data as Quote[])[0]);
  }
  async function selectQuote(q: Quote){
    setActive(q);
    const { data } = await supabase.from("quote_items").select("*").eq("quote_id", q.id);
    setItems(data||[]);
  }
  useEffect(()=>{ load() }, []);
  const matrixPax = [15,20,30,40,50];
  const matrix = useMemo(()=>{
    if(!active) return [];
    return matrixPax.map(pax=>{
      const net = items.reduce((acc, it)=>{
        const qty = it.quantity ?? 1;
        if(it.pricing_type === "per_group"){
          return acc + (it.cost_per_group||0) * qty;
        } else {
          const paying = it.service_type==="hotel" ? Math.max(pax - Math.floor(pax/20), 0) : pax;
          return acc + (it.cost_per_person||0) * paying;
        }
      }, 0);
      const gross = active.markup_type==="percent"
        ? net * (1 + (active.markup_value||0)/100)
        : net + (active.markup_value||0);
      const pp = gross / pax;
      return { pax, net: Number(net.toFixed(2)), gross: Number(gross.toFixed(2)), pp: Number(pp.toFixed(2)) }
    })
  }, [items, active]);
  function generatePdf(lang:"en"|"he"="en"){
    const doc = new jsPDF({orientation:"p", unit:"pt", format:"a4"});
    const rtl = lang==="he";
    const title = rtl ? "הצעת מחיר" : "Quote";
    doc.setFontSize(16); doc.text(title, 40, 50);
    if(active){
      const rows = [
        `${rtl?"שם קבוצה":"Group"}: ${active.group_name||""}`,
        `${rtl?"יעד":"Destination"}: ${active.destination||""}`,
        `${rtl?"תאריכים":"Dates"}: ${active.start_date||""} → ${active.end_date||""}`,
      ];
      rows.forEach((r,i)=> doc.text(r, 40, 80 + i*18));
    }
    let y = 160; doc.setFontSize(12);
    doc.text(rtl ? "מטריצת מחירים (נוסעים)" : "Price Matrix (PAX)", 40, y); y+=14;
    matrix.forEach(r=>{ doc.text(`${r.pax} → Net ${r.net}  |  Gross ${r.gross}  |  PP ${r.pp}`, 40, y); y+=16; });
    doc.save((active?.quote_number||"quote") + `-${lang}.pdf`);
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t("nav.quotes")}</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border rounded">
          <div className="p-3 font-medium">Quotes</div>
          <ul className="divide-y max-h-96 overflow-auto">
            {quotes.map(q=>(
              <li key={q.id} className={`p-3 cursor-pointer ${active?.id===q.id?"bg-gray-50":""}`} onClick={()=>selectQuote(q)}>
                <div className="font-medium">{q.quote_number}</div>
                <div className="text-sm text-gray-500">{q.group_name}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 space-y-3">
          {active && (
            <div className="bg-white border rounded p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{active.group_name}</div>
                  <div className="text-sm text-gray-500">{active.destination} • {active.group_size} pax</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 rounded bg-gray-900 text-white" onClick={()=>generatePdf("en")}>{t("quote.generatePdf")} EN</button>
                  <button className="px-3 py-2 rounded bg-gray-100" onClick={()=>generatePdf("he")}>{t("quote.generatePdf")} HE</button>
                </div>
              </div>
              <div className="mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">Service</th>
                      <th>Pricing</th>
                      <th>Qty</th>
                      <th>Per Pax</th>
                      <th>Per Group</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(it=>(
                      <tr key={it.id} className="border-b">
                        <td className="py-2">{it.item_name}</td>
                        <td>{it.pricing_type}</td>
                        <td>{it.quantity||1}</td>
                        <td>{it.cost_per_person||"-"}</td>
                        <td>{it.cost_per_group||"-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 bg-gray-50 p-3 rounded">
                <div className="font-medium mb-2">Matrix (15/20/30/40/50)</div>
                <div className="grid grid-cols-5 gap-2">
                  {matrix.map(m=>(
                    <div key={m.pax} className="bg-white border rounded p-2 text-center">
                      <div className="text-xs text-gray-500">{m.pax} pax</div>
                      <div className="text-sm">Net {m.net}</div>
                      <div className="text-sm font-semibold">Gross {m.gross}</div>
                      <div className="text-xs">PP {m.pp}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
