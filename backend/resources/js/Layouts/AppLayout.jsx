import { Link, usePage } from "@inertiajs/react";
import React from "react";

function NavLink({ href, children }) {
  const { url } = usePage();
  const active = url === href;
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm ${
        active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </Link>
  );
}

export default function AppLayout({ children }) {
  const { auth } = usePage().props ?? {};

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href={route("home") ?? "/"} className="flex items-center gap-3">
            {/* Simple placeholder logo (swap with SVG later) */}
            <div className="h-8 w-8 rounded-lg bg-red-600" />
            <span className="font-bold tracking-tight text-gray-900">MeetupClone</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink href={route("events.index") ?? "/events"}>Events</NavLink>
            <NavLink href={route("groups.index") ?? "/groups"}>Groups</NavLink>
            {auth?.user ? (
              <>
                <NavLink href={route("profile.edit") ?? "/profile"}>Profile</NavLink>
                <Link
                  href={route("logout") ?? "/logout"}
                  method="post"
                  as="button"
                  className="px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </Link>
              </>
            ) : (
              <>
                <NavLink href={route("login") ?? "/login"}>Log in</NavLink>
                <NavLink href={route("register") ?? "/register"}>Sign up</NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
