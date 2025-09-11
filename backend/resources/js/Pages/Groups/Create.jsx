import React from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    description: "",
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("groups.store"));
  };

  return (
    <AppLayout>
      <Head title="Create Group" />
      <div className="mb-6">
        <Link href={route("groups.index")} className="text-sm text-blue-600">
          &larr; Back to groups
        </Link>
        <h1 className="text-2xl font-bold mt-2">Create a new group</h1>
      </div>

      <form onSubmit={submit} className="bg-white border rounded-xl p-4 max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={data.name}
            onChange={(e) => setData("name", e.target.value)}
            maxLength={120}
            required
          />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="mt-1 w-full border rounded-lg px-3 py-2"
            rows={5}
            value={data.description}
            onChange={(e) => setData("description", e.target.value)}
            maxLength={2000}
            placeholder="What is this group about?"
          />
          {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
        </div>

        <div className="flex gap-2">
          <button disabled={processing} className="bg-red-600 text-white px-4 py-2 rounded-lg">
            {processing ? "Creating..." : "Create Group"}
          </button>
          <Link href={route("groups.index")} className="px-4 py-2 rounded-lg border">
            Cancel
          </Link>
        </div>
      </form>
    </AppLayout>
  );
}
