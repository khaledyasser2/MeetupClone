import React from "react";
import { Link, usePage } from "@inertiajs/react";

function yen(n) { return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n ?? 0); }
function fmt(dt) { return new Date(dt).toLocaleString("ja-JP", { dateStyle: "medium", timeStyle: "short" }); }

export default function Show() {
  const { props } = usePage();
  const { event: e } = props;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/events" className="text-blue-600">&larr; Back to events</Link>
        <h1 className="text-3xl font-bold mt-2">{e.title}</h1>
        <div className="text-gray-600">{e.group} • by {e.creator}</div>

        <div className="bg-white rounded-xl shadow p-4 mt-4 space-y-2">
          <div><b>When:</b> {fmt(e.start_at)}{e.end_at ? ` – ${fmt(e.end_at)}` : ""}</div>
          <div><b>Where:</b> {e.venue_name || e.venue_address || "TBA"}</div>
          {e.lat && e.lng ? (
            <a className="text-blue-600" href={`https://www.google.com/maps?q=${e.lat},${e.lng}`} target="_blank" rel="noreferrer">
              Open in Google Maps
            </a>
          ) : null}
          <div><b>Price:</b> {yen(e.price_yen)}</div>
          <div><b>Capacity:</b> {e.capacity ? e.capacity : "No limit"}</div>
        </div>

        {e.description ? (
          <div className="bg-white rounded-xl shadow p-4 mt-4">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="whitespace-pre-wrap text-gray-800">{e.description}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
