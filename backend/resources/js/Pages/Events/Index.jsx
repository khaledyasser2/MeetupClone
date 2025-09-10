import React, { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";

function yen(n) { return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n ?? 0); }
function fmt(dt) { return new Date(dt).toLocaleString("ja-JP", { dateStyle: "medium", timeStyle: "short" }); }

export default function Index() {
  const { props } = usePage();
  const { filters, events } = props;

  const [q, setQ] = useState(filters.q ?? "");
  const [year, setYear] = useState(filters.year ?? "");
  const [month, setMonth] = useState(filters.month ?? "");
  const [day, setDay] = useState(filters.day ?? "");

  const submit = (e) => {
    e.preventDefault();
    const params = { q, year, month, day };
    // remove empties
    Object.keys(params).forEach(k => (params[k] ? null : delete params[k]));
    router.get("/events", params, { preserveState: true, preserveScroll: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Search and filter by date.</p>
        </header>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-4 rounded-xl shadow">
          <input className="col-span-2 border rounded-lg px-3 py-2"
                 placeholder="Keyword (e.g. anime, cosplay)"
                 value={q} onChange={e=>setQ(e.target.value)} />
          <input className="border rounded-lg px-3 py-2" placeholder="Year" value={year} onChange={e=>setYear(e.target.value)} />
          <input className="border rounded-lg px-3 py-2" placeholder="Month" value={month} onChange={e=>setMonth(e.target.value)} />
          <input className="border rounded-lg px-3 py-2" placeholder="Day" value={day} onChange={e=>setDay(e.target.value)} />
          <div className="md:col-span-5 flex gap-2">
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg">Search</button>
            <button type="button" className="px-4 py-2 rounded-lg border"
              onClick={() => { setQ(""); setYear(""); setMonth(""); setDay(""); router.get("/events"); }}>
              Reset
            </button>
          </div>
        </form>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {events.data.map(ev => (
            <Link key={ev.id} href={`/events/${ev.id}`} className="bg-white rounded-xl shadow p-4 hover:shadow-md transition">
              <div className="text-sm text-gray-500">{ev.group || "—"}</div>
              <h3 className="text-lg font-semibold text-gray-900">{ev.title}</h3>
              <div className="text-gray-700">{fmt(ev.start_at)}</div>
              <div className="text-gray-700">{ev.venue_name || ev.venue_address || "TBA"}</div>
              <div className="mt-2 text-sm text-gray-600 flex gap-3">
                <span>{yen(ev.price_yen)}</span>
                {ev.capacity ? <span>• Capacity {ev.capacity}</span> : <span>• No limit</span>}
              </div>
              {ev.lat && ev.lng ? (
                <a className="text-blue-600 text-sm mt-2 inline-block"
                   href={`https://www.google.com/maps?q=${ev.lat},${ev.lng}`}
                   target="_blank" rel="noreferrer">Open in Google Maps</a>
              ) : null}
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex flex-wrap gap-2">
          {events.links.map((lnk, i) => (
            <Link key={i}
              href={lnk.url || "#"}
              preserveScroll
              className={`px-3 py-1 rounded border ${lnk.active ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              dangerouslySetInnerHTML={{ __html: lnk.label }} />
          ))}
        </div>
      </div>
    </div>
  );
}
