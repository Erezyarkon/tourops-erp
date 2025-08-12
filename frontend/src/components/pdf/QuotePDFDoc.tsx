import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 11 },
  h1: { fontSize: 18, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  table: { display: 'table', width: 'auto', marginTop: 12 },
  tr: { flexDirection: 'row' },
  th: { padding: 6, borderWidth: 1, fontWeight: 'bold' },
  td: { padding: 6, borderWidth: 1 },
  small: { fontSize: 9, marginTop: 8 }
});

export default function QuotePDFDoc({ quote, items, lang='en' }:{ quote:any; items:any[]; lang?:'en'|'he' }){
  const he = lang==='he';
  const L = (en:string, heS:string)=> he? heS : en;

  const pax = Number(quote.group_size||0);
  const cap = Number(quote.buses_capacity||50);
  const buses = Math.ceil(pax/(cap||50));
  const freeHotelPax = Math.floor(pax/20);

  let netGroup = 0;
  for(const it of items){
    const g = Number(it.cost_per_group||0);
    const p = Number(it.cost_per_person||0);
    if(it.service_type==='hotel'){
      netGroup += g + p*Math.max(pax - freeHotelPax, 0);
    } else {
      netGroup += g + p*pax;
    }
  }
  const netPerPax = netGroup/(pax||1);
  const markup = quote.markup_type==='percent' ? netPerPax*(Number(quote.markup_value||0)/100) : Number(quote.markup_value||0);
  const grossPerPax = netPerPax + markup;
  const grossGroup = grossPerPax * pax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{L('Price Quote','הצעת מחיר')}</Text>
        <View style={styles.row}>
          <Text>{L('Client','לקוח')}: {quote.customers?.name || '-'}</Text>
          <Text>{L('Group size','גודל קבוצה')}: {pax}</Text>
        </View>
        <View style={styles.row}>
          <Text>{L('Dates','תאריכים')}: {quote.start_date || '-'} → {quote.end_date || '-'}</Text>
          <Text>{L('Buses','אוטובוסים')}: {buses}</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={styles.th}>{L('Service','שירות')}</Text>
            <Text style={styles.th}>{L('Supplier','ספק')}</Text>
            <Text style={styles.th}>{L('Per pax','לנוסע')}</Text>
            <Text style={styles.th}>{L('Per group','לקבוצה')}</Text>
          </View>
          {items.map((it:any, idx:number)=>(
            <View key={idx} style={styles.tr}>
              <Text style={styles.td}>{it.service_type}</Text>
              <Text style={styles.td}>{it.suppliers?.name || '-'}</Text>
              <Text style={styles.td}>{it.cost_per_person ?? '-'}</Text>
              <Text style={styles.td}>{it.cost_per_group ?? '-'}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 12 }}>
          <Text>{L('Net / pax','נטו לנוסע')}: {netPerPax.toFixed(2)}</Text>
          <Text>{L('Gross / pax','ברוטו לנוסע')}: {grossPerPax.toFixed(2)}</Text>
          <Text>{L('Gross / group','ברוטו לקבוצה')}: {grossGroup.toFixed(2)}</Text>
        </View>
        <Text style={styles.small}>
          {L('* Hotels: 1 free pax per 20 paying (applies to per-person hotel costs).','* מלונות: נוסע אחד חינם על כל 20 משלמים (חל רק על עלויות פר-נוסע של מלונות).')}
        </Text>
      </Page>
    </Document>
  );
}