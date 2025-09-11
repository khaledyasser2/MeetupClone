import React, { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import AppLayout from "../../Layouts/AppLayout";

function yen(n) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n ?? 0);
}
function fmt(dt) {
  return new Date(dt).toLocaleString("ja-JP", { dateStyle: "medium", timeStyle: "short" });
}

// ---- date constraints (today as minimum) ----
const todayObj = new Date();
todayObj.setHours(0, 0, 0, 0);
const YEAR_MIN = todayObj.getFullYear();
const MONTH_MIN = todayObj.getMonth() + 1; // 1..12
const DAY_MIN = todayObj.getDate();        // 1..31
const YEAR_MAX = 2100;

// helpers
const sanitizeDigits = (v) => (v == null ? "" : String(v).replace(/\D/g, ""));
function blockNonNumericKeys(e) {
  const forbidden = ["e", "E", "+", "-", "."];
  if (forbidden.includes(e.key)) e.preventDefault();
}
function boundsFor(y, m) {
  const yearNum = Number(y);
  const monthNum = Number(m);
  const monthMin = yearNum === YEAR_MIN ? MONTH_MIN : 1;
  const dayMin = (yearNum === YEAR_MIN && monthNum === MONTH_MIN) ? DAY_MIN : 1;
  return { monthMin, dayMin };
}
function clamp(n, lo, hi) {
  if (n === "" || n == null) return "";
  const x = Number(n);
  if (Number.isNaN(x)) return "";
  return Math.min(Math.max(x, lo), hi);
}
function validYMD(y, m, d) {
  // allow empty filters
  if (!y && !m && !d) return true;

  // base range checks
  if (y && (y < YEAR_MIN || y > YEAR_MAX)) return false;

  const { monthMin, dayMin } = boundsFor(y, m);
  if (m && (m < monthMin || m > 12)) return false;
  if (d && (d < dayMin || d > 31)) return false;

  // full date validation (real calendar date + not in the past)
  if (y && m && d) {
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    if (
      dt.getFullYear() !== Number(y) ||
      dt.getMonth() !== Number(m) - 1 ||
      dt.getDate() !== Number(d)
    ) return false;
    dt.setHours(0, 0, 0, 0);
    if (dt < todayObj) return false;
  }
  return true;
}

export default function Index() {
  const { props } = usePage();
  const { filters, events } = props;

  const [q, setQ] = useState(filters.q ?? "");
  const [year, setYear] = useState(sanitizeDigits(filters.year ?? ""));
  const [month, setMonth] = useState(sanitizeDigits(filters.month ?? ""));
  const [day, setDay] = useState(sanitizeDigits(filters.day ?? ""));
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();

    // dynamic mins based on selections
    const { monthMin, dayMin } = boundsFor(year, month);

    // clamp (keep empty as empty)
    const y = year === "" ? "" : clamp(Number(year), YEAR_MIN, YEAR_MAX);
    const m = month === "" ? "" : clamp(Number(month), monthMin, 12);
    const d = day === "" ? "" : clamp(Number(day), dayMin, 31);

    if (!validYMD(y || null, m || null, d || null)) {
      setErr("Please enter a valid date (no past dates; month/day constrained by year/month).");
      return;
    }
    setErr("");

    const params = { q };
    if (y !== "" && y != null) params.year = y;
    if (m !== "" && m != null) params.month = m;
    if (d !== "" && d != null) params.day = d;

    router.get("/events", params, { preserveState: true, preserveScroll: true });
  };

  const reset = () => {
    setQ("");
    setYear("");
    setMonth("");
    setDay("");
    setErr("");
    router.get("/events");
  };

  // dynamic mins for input attributes
  const { monthMin, dayMin } = boundsFor(year, month);

  return (
    <AppLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-600">Search and filter by date.</p>
            </header>

            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-4 rounded-xl shadow">
              <input
                className="col-span-2 border rounded-lg px-3 py-2"
                placeholder="Keyword (e.g. anime, cosplay)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />

              <input
            className="border rounded-lg px-3 py-2"
                placeholder="Year"
                type="number"
                inputMode="numeric"
                step="1"
                min={YEAR_MIN}
                max={YEAR_MAX}
                value={year}
                onKeyDown={blockNonNumericKeys}
                onChange={(e) => {
                  const v = sanitizeDigits(e.target.value);
                  setYear(v);
                  // clear dependent fields if they fall below new mins
                  const { monthMin: newMonthMin } = boundsFor(v, month);
                  if (month && Number(month) < newMonthMin) setMonth("");
                  if (day) setDay(""); // safest to clear day on year change
                }}
              />

              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Month"
                type="number"
                inputMode="numeric"
                step="1"
                min={monthMin}
                max={12}
                value={month}
                onKeyDown={blockNonNumericKeys}
                onChange={(e) => {
                  const v = sanitizeDigits(e.target.value);
                  setMonth(v);
                  // clear day if month changes below required min
                  const { dayMin: newDayMin } = boundsFor(year, v);
                  if (day && Number(day) < newDayMin) setDay("");
                }}
              />

              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Day"
                type="number"
                inputMode="numeric"
                step="1"
                min={dayMin}
                max={31}
                value={day}
                onKeyDown={blockNonNumericKeys}
                onChange={(e) => setDay(sanitizeDigits(e.target.value))}
              />

              <div className="md:col-span-5 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg">Search</button>
                  <button type="button" className="px-4 py-2 rounded-lg border" onClick={reset}>
                    Reset
                  </button>
                </div>
                {err && <div className="text-sm text-red-600">{err}</div>}
              </div>
            </form>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {events.data.map((ev) => (
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
                    <a
                      className="text-blue-600 text-sm mt-2 inline-block"
                      href={`https://www.google.com/maps?q=${ev.lat},${ev.lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Google Maps
                    </a>
                  ) : null}
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex flex-wrap gap-2">
              {events.links.map((lnk, i) => (
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
          </div>
        </div>
    </AppLayout>
  );
}
