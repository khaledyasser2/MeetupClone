import React from "react";
import { Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";

function fmt(dt) {
  return new Date(dt).toLocaleString("ja-JP", { dateStyle: "medium", timeStyle: "short" });
}
function yen(n) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n ?? 0);
}

export default function Show({ group }) {
  return (
    <AppLayout>
      <div className="mb-6">
        <Link href="/groups" className="text-sm text-blue-600">&larr; Back to groups</Link>
        <h1 className="text-2xl font-bold mt-2">{group.name}</h1>
        {group.owner && <div className="text-gray-600 text-sm">Owner: {group.owner.name}</div>}
        <p className="text-gray-700 mt-2">{group.description || "No description."}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-4">
          <h2 className="font-semibold mb-3">Upcoming events</h2>
          <div className="space-y-3">
            {group.events.length === 0 && <div className="text-gray-600 text-sm">No events yet.</div>}
            {group.events.map((e) => (
              <Link key={e.id} href={`/events/${e.id}`} className="block border rounded-lg p-3 hover:bg-gray-50">
                <div className="font-medium">{e.title}</div>
                <div className="text-sm text-gray-600">{fmt(e.start_at)} • {yen(e.price_yen)} • {e.capacity ? `Capacity ${e.capacity}` : 'No limit'}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <h2 className="font-semibold mb-3">Members</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {group.members.map((m) => (
              <li key={m.id} className="border rounded-lg px-3 py-2">{m.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
