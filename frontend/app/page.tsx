"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquareWarning,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

type Facility = {
  id: number;
  location: string;
  cleanliness_score: number;
  status?: string;
};

type Complaint = {
  id: number;
  status?: string;
};

type Inspection = {
  id: number;
  facility_id?: number;
  inspection_date?: string;
};

// ======================================================
// DASHBOARD
// ======================================================

export default function Dashboard() {
  const pathname = usePathname();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  // ====================================================
  // LOAD DATA
  // ====================================================

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const fetchData = async <T,>(url: string): Promise<T[]> => {
        const response = await fetch(url, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`${url} returned ${response.status}`);
        }

        const data = await response.json();

        return Array.isArray(data) ? data : [];
      };

      const results = await Promise.allSettled([
        fetchData<Facility>("/api/facilities"),
        fetchData<Complaint>("/api/complaints"),
        fetchData<Inspection>("/api/inspections"),
      ]);

      const [
        facilityResult,
        complaintResult,
        inspectionResult,
      ] = results;

      if (facilityResult.status === "fulfilled") {
        setFacilities(facilityResult.value);
      }

      if (complaintResult.status === "fulfilled") {
        setComplaints(complaintResult.value);
      }

      if (inspectionResult.status === "fulfilled") {
        setInspections(inspectionResult.value);
      }

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedRequests.length > 0) {
        setError(
          "Some dashboard data could not be loaded. Please check your backend connection."
        );
      }
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        "Unable to connect to the dashboard services. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // ====================================================
  // STATISTICS
  // ====================================================

  const totalFacilities = facilities.length;

  // Your facilities table does not have a status column.
  // Therefore all registered facilities are treated as active.
  const activeFacilities = facilities.length;

  const openComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const status = complaint.status?.toLowerCase();

      return status === "open" || status === "pending";
    }).length;
  }, [complaints]);

  const averageCleanliness = useMemo(() => {
    if (!facilities.length) return 0;

    const total = facilities.reduce(
      (sum, facility) =>
        sum + Number(facility.cleanliness_score || 0),
      0
    );

    return Math.round(total / facilities.length);
  }, [facilities]);

  const healthyFacilities = facilities.filter(
    (facility) =>
      Number(facility.cleanliness_score || 0) >= 80
  ).length;

  const moderateFacilities = facilities.filter((facility) => {
    const score = Number(
      facility.cleanliness_score || 0
    );

    return score >= 70 && score < 80;
  }).length;

  const attentionFacilities = facilities.filter(
    (facility) =>
      Number(facility.cleanliness_score || 0) < 70
  ).length;

  // ====================================================
  // LOADING SCREEN
  // ====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Activity
              size={26}
              className="animate-pulse"
            />
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            Loading dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Preparing your facility overview...
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">

      {/* ==================================================
          MOBILE SIDEBAR OVERLAY
          ================================================== */}

      {mobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* ==================================================
          SIDEBAR
          ================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0b1730] text-white transition-transform duration-300 lg:translate-x-0 ${
          mobileMenu
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* Logo */}

        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">

          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setMobileMenu(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/30">
              <Building2 size={21} />
            </div>

            <div>
              <h1 className="font-bold tracking-tight">
                Smart Facility
              </h1>

              <p className="text-xs text-slate-400">
                Management System
              </p>
            </div>
          </Link>

          <button
            onClick={() => setMobileMenu(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>

        </div>

        {/* Navigation */}

        <div className="flex-1 overflow-y-auto px-4 py-6">

          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1">

            {/* DASHBOARD */}

            <SidebarItem
              href="/"
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
              active={pathname === "/"}
              onClick={() => setMobileMenu(false)}
            />

            {/* FACILITIES */}

            <SidebarItem
              href="/facilities"
              icon={<Building2 size={18} />}
              label="Facilities"
              active={pathname.startsWith("/facilities")}
              onClick={() => setMobileMenu(false)}
            />

            {/* INSPECTIONS */}

            <SidebarItem
              href="/inspections"
              icon={<ClipboardCheck size={18} />}
              label="Inspections"
              active={pathname.startsWith("/inspections")}
              onClick={() => setMobileMenu(false)}
            />

            {/* COMPLAINTS */}

            <SidebarItem
              href="/complaints"
              icon={<MessageSquareWarning size={18} />}
              label="Complaints"
              active={pathname.startsWith("/complaints")}
              badge={
                openComplaints > 0
                  ? openComplaints
                  : undefined
              }
              onClick={() => setMobileMenu(false)}
            />

          </nav>

          <p className="mb-3 mt-9 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Administration
          </p>

          <nav className="space-y-1">

            <SidebarItem
              href="#"
              icon={<Users size={18} />}
              label="Users"
            />

            <SidebarItem
              href="#"
              icon={<Settings size={18} />}
              label="Settings"
            />

          </nav>

        </div>

        {/* System Status */}

        <div className="border-t border-white/10 p-4">

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <ShieldCheck size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  System Status
                </p>

                <div className="mt-1 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-xs text-emerald-400">
                    Operational
                  </span>

                </div>
              </div>

            </div>

          </div>

          <div className="mt-4 flex items-center gap-3 px-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
              A
            </div>

            <div>
              <p className="text-sm font-semibold">
                Administrator
              </p>

              <p className="text-xs text-slate-500">
                Facility Manager
              </p>
            </div>

          </div>

        </div>

      </aside>

      {/* ==================================================
          MAIN
          ================================================== */}

      <main className="min-h-screen lg:ml-72">

        {/* ==================================================
            TOP HEADER
            ================================================== */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">

          <div className="flex h-20 items-center justify-between px-5 sm:px-8">

            <div className="flex items-center gap-4">

              <button
                onClick={() => setMobileMenu(true)}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Workspace
                </p>

                <h2 className="text-lg font-bold text-slate-900">
                  Dashboard
                </h2>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 sm:flex">

                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-xs font-semibold text-emerald-700">
                  All systems operational
                </span>

              </div>

              <button
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                <span className="hidden sm:block">
                  Refresh
                </span>

              </button>

            </div>

          </div>

        </header>

        {/* ==================================================
            CONTENT
            ================================================== */}

        <div className="mx-auto max-w-[1500px] p-5 sm:p-8">

          {/* Error */}

          {error && (
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-3">

                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>

                  <p className="text-sm font-semibold text-red-800">
                    Dashboard connection issue
                  </p>

                  <p className="mt-1 text-xs text-red-600">
                    {error}
                  </p>

                </div>

              </div>

              <button
                onClick={() => loadDashboard(true)}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                Try again
              </button>

            </div>
          )}

          {/* ==================================================
              WELCOME BANNER
              ================================================== */}

          <section className="relative mb-7 overflow-hidden rounded-2xl bg-gradient-to-br from-[#173d78] via-[#1d5ba4] to-[#2879bd] p-6 text-white shadow-xl shadow-blue-100 sm:p-8">

            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />

            <div className="absolute -bottom-28 right-32 h-72 w-72 rounded-full bg-white/5" />

            <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

              <div>

                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur">

                  <Activity size={14} />

                  Facility Operations

                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Welcome back, Administrator
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                  Monitor facility performance, inspections,
                  cleanliness and complaints from one central
                  workspace.
                </p>

              </div>

              <div className="flex shrink-0 flex-wrap gap-3">

                <Link
                  href="/facilities"
                  className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20"
                >
                  <Building2 size={17} />
                  Facilities
                </Link>

                <Link
                  href="/complaints"
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
                >
                  <Plus size={17} />
                  New Complaint
                </Link>

              </div>

            </div>

          </section>

          {/* ==================================================
              KPI CARDS
              ================================================== */}

          <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <KpiCard
              title="Total Facilities"
              value={totalFacilities}
              description="Registered locations"
              icon={<Building2 size={21} />}
              iconClass="bg-blue-50 text-blue-600"
              href="/facilities"
            />

            <KpiCard
              title="Active Facilities"
              value={activeFacilities}
              description="Currently operational"
              icon={<CheckCircle2 size={21} />}
              iconClass="bg-emerald-50 text-emerald-600"
              href="/facilities"
            />

            <KpiCard
              title="Open Complaints"
              value={openComplaints}
              description="Require attention"
              icon={
                <MessageSquareWarning size={21} />
              }
              iconClass="bg-orange-50 text-orange-600"
              href="/complaints"
            />

            <KpiCard
              title="Avg. Cleanliness"
              value={`${averageCleanliness}%`}
              description="Overall facility score"
              icon={<Activity size={21} />}
              iconClass="bg-violet-50 text-violet-600"
              href="/inspections"
            />

          </section>

          {/* ==================================================
              MAIN GRID
              ================================================== */}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(350px,0.85fr)]">

            {/* ==================================================
                FACILITY HEALTH
                ================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 p-5 sm:p-6">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      Facility Health
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Current cleanliness performance
                    </p>

                  </div>

                  <Link
                    href="/facilities"
                    className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View all
                    <ArrowRight size={16} />
                  </Link>

                </div>

                {/* Health Summary */}

                <div className="mt-6 grid gap-3 sm:grid-cols-3">

                  <HealthSummary
                    title="Healthy"
                    value={healthyFacilities}
                    description="80% and above"
                    icon={<CheckCircle2 size={18} />}
                    className="bg-emerald-50 text-emerald-700"
                  />

                  <HealthSummary
                    title="Moderate"
                    value={moderateFacilities}
                    description="70% – 79%"
                    icon={<Clock3 size={18} />}
                    className="bg-amber-50 text-amber-700"
                  />

                  <HealthSummary
                    title="Attention"
                    value={attentionFacilities}
                    description="Below 70%"
                    icon={<AlertTriangle size={18} />}
                    className="bg-red-50 text-red-700"
                  />

                </div>

              </div>

              {/* Facility List */}

              <div className="p-5 sm:p-6">

                {facilities.length === 0 ? (
                  <EmptyState
                    icon={<Building2 size={28} />}
                    title="No facilities found"
                    description="Add a facility to start monitoring its health and performance."
                    href="/facilities"
                    action="Add Facility"
                  />
                ) : (
                  <div className="space-y-3">

                    {facilities
                      .slice(0, 6)
                      .map((facility) => (
                        <FacilityRow
                          key={facility.id}
                          facility={facility}
                        />
                      ))}

                  </div>
                )}

              </div>

            </section>

            {/* ==================================================
                RIGHT COLUMN
                ================================================== */}

            <div className="space-y-6">

              {/* Recent Inspections */}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 p-5">

                  <div>

                    <h2 className="font-bold text-slate-900">
                      Recent Inspections
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Latest facility activity
                    </p>

                  </div>

                  <Link
                    href="/inspections"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600"
                  >
                    <ChevronRight size={19} />
                  </Link>

                </div>

                <div className="p-5">

                  {inspections.length === 0 ? (
                    <EmptyState
                      icon={<ClipboardCheck size={25} />}
                      title="No inspections yet"
                      description="Inspection records will appear here."
                    />
                  ) : (
                    <div className="space-y-4">

                      {inspections
                        .slice(0, 5)
                        .map((inspection) => (
                          <InspectionRow
                            key={inspection.id}
                            inspection={inspection}
                          />
                        ))}

                    </div>
                  )}

                </div>

              </section>

              {/* Quick Actions */}

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="mb-4">

                  <h2 className="font-bold text-slate-900">
                    Quick Actions
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Frequently used management tools
                  </p>

                </div>

                <div className="grid gap-2">

                  <QuickAction
                    href="/facilities"
                    icon={<Building2 size={18} />}
                    title="Manage Facilities"
                    description="View and update locations"
                  />

                  <QuickAction
                    href="/inspections"
                    icon={<ClipboardCheck size={18} />}
                    title="View Inspections"
                    description="Review inspection records"
                  />

                  <QuickAction
                    href="/complaints"
                    icon={
                      <MessageSquareWarning size={18} />
                    }
                    title="Manage Complaints"
                    description="Track reported issues"
                  />

                </div>

              </section>

            </div>

          </div>

          {/* ==================================================
              SYSTEM OVERVIEW
              ================================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-5">

              <h2 className="font-bold text-slate-900">
                System Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current activity across the platform
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <OverviewMetric
                icon={<ClipboardCheck size={19} />}
                title="Inspections"
                value={inspections.length}
                description="Total records"
                iconClass="bg-indigo-50 text-indigo-600"
              />

              <OverviewMetric
                icon={<MessageSquareWarning size={19} />}
                title="Complaints"
                value={complaints.length}
                description="Total reported"
                iconClass="bg-orange-50 text-orange-600"
              />

              <OverviewMetric
                icon={<Building2 size={19} />}
                title="Facilities"
                value={facilities.length}
                description="Registered locations"
                iconClass="bg-blue-50 text-blue-600"
              />

              <OverviewMetric
                icon={<ShieldCheck size={19} />}
                title="API Status"
                value={error ? "Issues" : "Connected"}
                description={
                  error
                    ? "Check backend"
                    : "Backend connection"
                }
                iconClass={
                  error
                    ? "bg-red-50 text-red-600"
                    : "bg-emerald-50 text-emerald-600"
                }
              />

            </div>

          </section>

        </div>

      </main>
    </div>
  );
}

// ======================================================
// SIDEBAR ITEM
// ======================================================

function SidebarItem({
  href,
  icon,
  label,
  active = false,
  badge,
  onClick,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >

      <span
        className={
          active
            ? "text-white"
            : "text-slate-500 group-hover:text-slate-300"
        }
      >
        {icon}
      </span>

      <span className="flex-1">
        {label}
      </span>

      {badge !== undefined && (
        <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}

    </Link>
  );
}

// ======================================================
// KPI CARD
// ======================================================

function KpiCard({
  title,
  value,
  description,
  icon,
  iconClass,
  href,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: ReactNode;
  iconClass: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">

        <span className="text-xs font-medium text-slate-400">
          View details
        </span>

        <ArrowRight
          size={15}
          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
        />

      </div>

    </Link>
  );
}

// ======================================================
// HEALTH SUMMARY
// ======================================================

function HealthSummary({
  title,
  value,
  description,
  icon,
  className,
}: {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  className: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${className}`}>

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/70">
          {icon}
        </div>

        <div className="min-w-0 flex-1">

          <p className="text-sm font-semibold">
            {title}
          </p>

          <p className="mt-0.5 text-[11px] opacity-70">
            {description}
          </p>

        </div>

        <span className="text-2xl font-bold">
          {value}
        </span>

      </div>

    </div>
  );
}

// ======================================================
// FACILITY ROW
// ======================================================

function FacilityRow({
  facility,
}: {
  facility: Facility;
}) {
  const score = Math.min(
    Math.max(
      Number(facility.cleanliness_score || 0),
      0
    ),
    100
  );

  const status =
    score >= 80
      ? "Healthy"
      : score >= 70
        ? "Moderate"
        : "Attention";

  const statusClass =
    score >= 80
      ? "bg-emerald-50 text-emerald-700"
      : score >= 70
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  const progressClass =
    score >= 80
      ? "bg-emerald-500"
      : score >= 70
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="rounded-xl border border-slate-100 p-4 transition hover:border-blue-100 hover:bg-slate-50/60">

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <MapPin size={18} />
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Facility #{facility.id}
              </p>

              <p className="mt-0.5 truncate font-semibold text-slate-900">
                {facility.location ||
                  "Unknown location"}
              </p>

            </div>

            <span
              className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}
            >
              {status}
            </span>

          </div>

          <div className="mt-4">

            <div className="mb-2 flex items-center justify-between">

              <span className="text-xs font-medium text-slate-500">
                Cleanliness score
              </span>

              <span className="text-sm font-bold text-slate-800">
                {score}%
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className={`h-full rounded-full transition-all ${progressClass}`}
                style={{
                  width: `${score}%`,
                }}
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

// ======================================================
// INSPECTION ROW
// ======================================================

function InspectionRow({
  inspection,
}: {
  inspection: Inspection;
}) {
  const date = inspection.inspection_date
    ? new Date(
        inspection.inspection_date
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Date unavailable";

  return (
    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <ClipboardCheck size={18} />
      </div>

      <div className="min-w-0 flex-1">

        <p className="truncate text-sm font-semibold text-slate-800">
          Inspection #{inspection.id}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          Facility{" "}
          {inspection.facility_id
            ? `#${inspection.facility_id}`
            : "—"}
        </p>

      </div>

      <span className="shrink-0 text-xs font-medium text-slate-400">
        {date}
      </span>

    </div>
  );
}

// ======================================================
// QUICK ACTION
// ======================================================

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-100 hover:bg-blue-50/50"
    >

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="truncate text-xs text-slate-400">
          {description}
        </p>

      </div>

      <ChevronRight
        size={16}
        className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
      />

    </Link>
  );
}

// ======================================================
// OVERVIEW METRIC
// ======================================================

function OverviewMetric({
  icon,
  title,
  value,
  description,
  iconClass,
}: {
  icon: ReactNode;
  title: string;
  value: string | number;
  description: string;
  iconClass: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs font-medium text-slate-400">
          {title}
        </p>

        <p className="mt-0.5 text-xl font-bold text-slate-900">
          {value}
        </p>

        <p className="text-[11px] text-slate-400">
          {description}
        </p>

      </div>

    </div>
  );
}

// ======================================================
// EMPTY STATE
// ======================================================

function EmptyState({
  icon,
  title,
  description,
  href,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">

      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
        {icon}
      </div>

      <p className="font-semibold text-slate-700">
        {title}
      </p>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {description}
      </p>

      {href && action && (
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={14} />
          {action}
        </Link>
      )}

    </div>
  );
}