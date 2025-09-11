import React, { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";

function Section({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((g) => (
          <Link key={g.id} href={`/groups/${g.id}`} className="bg-white border rounded-xl p-4 hover:shadow transition">
            <h3 className="text-base font-semibold">{g.name}</h3>
            <p className="text-gray-600 line-clamp-2">{g.description || "No description"}</p>
            {typeof g.members_count !== "undefined" && (
              <div className="text-sm text-gray-500 mt-2">{g.members_count} members</div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Index({ params, owned_or_organized, member, other }) {
  const [q, setQ] = useState(params?.q ?? "");
  const { auth } = usePage().props ?? {};

  const submit = (e) => {
    e.preventDefault();
    const p = {};
    if (q) p.q = q;
    router.get("/groups", p, { preserveState: true, preserveScroll: true });
  };

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-gray-600">Your communities, then the rest.</p>
        </div>

        {auth?.user && (
          <Link
            href={route("groups.create") ?? "/groups/create"}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            + Create Group
          </Link>
        )}
      </div>

      <form onSubmit={submit} className="bg-white p-4 rounded-xl border flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Search groups (e.g. anime, hiking)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg">Search</button>
        <button
          type="button"
          onClick={() => { setQ(""); router.get("/groups"); }}
          className="px-4 py-2 rounded-lg border"
        >
          Reset
        </button>
      </form>

      <Section title="Groups you own / organize" items={owned_or_organized} />
      <Section title="Groups you’re a member of" items={member} />

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Other public groups</h2>
        {other?.data?.length ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {other.data.map((g) => (
                <Link key={g.id} href={`/groups/${g.id}`} className="bg-white border rounded-xl p-4 hover:shadow transition">
                  <h3 className="text-base font-semibold">{g.name}</h3>
                  <p className="text-gray-600 line-clamp-2">{g.description || "No description"}</p>
                  <div className="text-sm text-gray-500 mt-2">{g.members_count} members</div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex flex-wrap gap-2">
              {other.links.map((lnk, i) => (
                <Link
                  key={i}
                  href={lnk.url || "#"}
                  preserveScroll
                  className={`px-3 py-1 rounded border ${
                    lnk.active ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  dangerouslySetInnerHTML={{ __html: lnk.label }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-gray-600">No results.</div>
        )}
      </section>
    </AppLayout>
  );
}
