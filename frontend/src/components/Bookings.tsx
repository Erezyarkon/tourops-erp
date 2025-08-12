import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useTranslation } from "react-i18next";
type Booking = { id?:string; booking_number?:string; total_amount?:number; status?:string; created_at?:string }
export function Bookings(){
  const { t } = useTranslation();
  const [items, setItems] = useState<Booking[]>([]);
  useEffect(()=>{ (async()=>{
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending:false });
    setItems(data||[]);
  })() }, []);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t("nav.bookings")}</h2>
      <table className="w-full bg-white border rounded text-sm">
        <thead><tr className="text-left border-b"><th className="p-2">#</th><th>Total</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>
          {items.map(b=>(
            <tr key={b.id} className="border-b">
              <td className="p-2">{b.booking_number}</td>
              <td>{b.total_amount}</td>
              <td>{b.status}</td>
              <td>{new Date(b.created_at||"").toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
