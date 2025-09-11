
import React, { useState } from "react";
import { router } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";

export default function Edit({ group }) {
  const [form, setForm] = useState({
    name: group.name || "",
    description: group.description || "",
    location_city: group.location_city || "",
  });

  const submit = (e) => {
    e.preventDefault();
    router.put(`/groups/${group.id}`, form);
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Edit Group</h1>
      <form onSubmit={submit} className="space-y-4 max-w-lg bg-white border p-4 rounded-xl">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Group name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <textarea
          className="w-full border rounded px-3 py-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="City"
          value={form.location_city}
          onChange={(e) => setForm({ ...form, location_city: e.target.value })}
        />
        <button className="bg-red-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </AppLayout>
  );
}
