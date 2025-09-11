import React from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";

import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";

export default function Edit({ mustVerifyEmail, status }) {
  return (
    <AppLayout>
      <Head title="Profile" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-gray-600">Manage your account information and security.</p>
      </div>

      <div className="space-y-6 max-w-7xl">
        <div className="bg-white border rounded-xl p-4 shadow-sm sm:p-6">
          <UpdateProfileInformationForm
            mustVerifyEmail={mustVerifyEmail}
            status={status}
            className="max-w-xl"
          />
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm sm:p-6">
          <UpdatePasswordForm className="max-w-xl" />
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm sm:p-6">
          <DeleteUserForm className="max-w-xl" />
        </div>
      </div>
    </AppLayout>
  );
}
