import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";
type Supplier = { id?: string; name:string; category?:string; contact_name?:string; phone?:string; email?:string; }
export function Suppliers(){
  const { t } = useTranslation();
  const [items, setItems] = useState<Supplier[]>([]);
  const [draft, setDraft] = useState<Supplier>({ name:"", category:"" });
  async function load(){
    const { data } = await supabase.from("suppliers").select("*").order("created_at", { ascending:false });
    setItems(data||[]);
  }
  useEffect(()=>{ load() }, []);
  async function add(){
    if(!draft.name) return;
    await supabase.from("suppliers").insert(draft as any);
    setDraft({ name:"", category:"" });
    load();
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t("nav.suppliers")}</h2>
      <div className="flex gap-2">
        <input className="border rounded px-3 py-2" placeholder="Name" value={draft.name} onChange={e=>setDraft({...draft, name:e.target.value})} />
        <input className="border rounded px-3 py-2" placeholder="Category" value={draft.category} onChange={e=>setDraft({...draft, category:e.target.value})} />
        <button className="px-3 py-2 rounded bg-gray-900 text-white" onClick={add}>Add</button>
      </div>
      <ul className="divide-y bg-white border rounded">
        {items.map(s=>(
          <li key={s.id} className="p-3 flex justify-between">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-sm text-gray-500">{s.category}</div>
            </div>
            <div className="text-sm">{s.email||""}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
