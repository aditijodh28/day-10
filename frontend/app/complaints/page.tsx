"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Eye,
  MessageSquareWarning,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  Clock3,
  RefreshCw,
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

type Facility = {
  id: number;
  location: string;
};

type Complaint = {
  id: number;
  facility_id: number;
  facility_location?: string;
  description: string;
  status: "Open" | "Pending" | "Resolved";
  created_at?: string;
};

type ComplaintForm = {
  facility_id: number;
  description: string;
  status: "Open" | "Pending" | "Resolved";
};

// ======================================================
// EMPTY FORM
// ======================================================

const emptyForm: ComplaintForm = {
  facility_id: 0,
  description: "",
  status: "Open",
};

// ======================================================
// PAGE
// ======================================================

export default function ComplaintsPage() {
  const [complaints, setComplaints] =
    useState<Complaint[]>([]);

  const [facilities, setFacilities] =
    useState<Facility[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [showModal, setShowModal] =
    useState(false);

  const [editingComplaint, setEditingComplaint] =
    useState<Complaint | null>(null);

  const [viewingComplaint, setViewingComplaint] =
    useState<Complaint | null>(null);

  const [form, setForm] =
    useState<ComplaintForm>(emptyForm);

  const [saving, setSaving] = useState(false);

  // ====================================================
  // LOAD DATA
  // ====================================================

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        complaintsResponse,
        facilitiesResponse,
      ] = await Promise.all([
        fetch("/api/complaints", {
          cache: "no-store",
        }),
        fetch("/api/facilities", {
          cache: "no-store",
        }),
      ]);

      const complaintsData =
        await complaintsResponse.json();

      const facilitiesData =
        await facilitiesResponse.json();

      if (!complaintsResponse.ok) {
        throw new Error(
          complaintsData.error ||
            "Failed to load complaints"
        );
      }

      if (!facilitiesResponse.ok) {
        throw new Error(
          facilitiesData.error ||
            "Failed to load facilities"
        );
      }

      setComplaints(
        Array.isArray(complaintsData)
          ? complaintsData
          : []
      );

      setFacilities(
        Array.isArray(facilitiesData)
          ? facilitiesData
          : []
      );
    } catch (error) {
      console.error(
        "Complaints loading error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load complaints"
      );
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // REFRESH
  // ====================================================

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }

  // ====================================================
  // OPEN ADD MODAL
  // ====================================================

  function handleAdd() {
    setEditingComplaint(null);

    setForm({
      facility_id:
        facilities.length > 0
          ? facilities[0].id
          : 0,
      description: "",
      status: "Open",
    });

    setShowModal(true);
  }

  // ====================================================
  // OPEN EDIT MODAL
  // ====================================================

  function handleEdit(
    complaint: Complaint
  ) {
    setEditingComplaint(complaint);

    setForm({
      facility_id: Number(
        complaint.facility_id || 0
      ),
      description:
        complaint.description || "",
      status:
        complaint.status || "Open",
    });

    setShowModal(true);
  }

  // ====================================================
  // FORM CHANGE
  // ====================================================

  function handleChange(
    e:
      | React.ChangeEvent<
          HTMLInputElement
        >
      | React.ChangeEvent<
          HTMLTextAreaElement
        >
      | React.ChangeEvent<
          HTMLSelectElement
        >
  ) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "facility_id"
          ? Number(value)
          : value,
    }));
  }

  // ====================================================
  // SUBMIT
  // ====================================================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!form.facility_id) {
      alert("Please select a facility.");
      return;
    }

    if (!form.description.trim()) {
      alert(
        "Please enter complaint description."
      );
      return;
    }

    try {
      setSaving(true);

      const url = editingComplaint
        ? `/api/complaints/${editingComplaint.id}`
        : "/api/complaints";

      const method = editingComplaint
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facility_id:
            form.facility_id,
          description:
            form.description.trim(),
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save complaint"
        );
      }

      setShowModal(false);
      setEditingComplaint(null);
      setForm(emptyForm);

      await loadData();
    } catch (error) {
      console.error(
        "Complaint save error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save complaint"
      );
    } finally {
      setSaving(false);
    }
  }

  // ====================================================
  // DELETE
  // ====================================================

  async function handleDelete(
    id: number
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this complaint?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/complaints/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete complaint"
        );
      }

      setComplaints((previous) =>
        previous.filter(
          (complaint) =>
            complaint.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Complaint delete error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete complaint"
      );
    }
  }

  // ====================================================
  // FILTER
  // ====================================================

  const filteredComplaints =
    useMemo(() => {
      const searchText =
        search.toLowerCase().trim();

      return complaints.filter(
        (complaint) => {
          const id = String(
            complaint.id || ""
          ).toLowerCase();

          const facilityId =
            String(
              complaint.facility_id || ""
            ).toLowerCase();

          const facilityLocation =
            String(
              complaint.facility_location ||
                ""
            ).toLowerCase();

          const description =
            String(
              complaint.description || ""
            ).toLowerCase();

          const status =
            String(
              complaint.status || ""
            ).toLowerCase();

          const matchesSearch =
            !searchText ||
            id.includes(searchText) ||
            facilityId.includes(searchText) ||
            facilityLocation.includes(
              searchText
            ) ||
            description.includes(
              searchText
            ) ||
            status.includes(searchText);

          const matchesStatus =
            statusFilter === "All" ||
            complaint.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      complaints,
      search,
      statusFilter,
    ]);

  // ====================================================
  // COUNTS
  // ====================================================

  const openCount =
    complaints.filter(
      (complaint) =>
        complaint.status === "Open"
    ).length;

  const pendingCount =
    complaints.filter(
      (complaint) =>
        complaint.status === "Pending"
    ).length;

  const resolvedCount =
    complaints.filter(
      (complaint) =>
        complaint.status === "Resolved"
    ).length;

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">

      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            HEADER
            ================================================== */}

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
              <MessageSquareWarning
                size={18}
              />
              Complaint Management
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Complaints
            </h1>

            <p className="mt-1 text-slate-500">
              Manage, track and resolve facility
              complaints.
            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
            >

              <RefreshCw
                size={18}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh

            </button>

            <button
              onClick={handleAdd}
              disabled={
                facilities.length === 0
              }
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={20} />
              Add Complaint
            </button>

          </div>

        </div>

        {/* ==================================================
            ERROR
            ================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>

              <p className="font-semibold">
                Error loading complaints
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>

            </div>

          </div>
        )}

        {/* ==================================================
            STATISTICS
            ================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Complaints"
            value={complaints.length}
            icon={
              <MessageSquareWarning
                size={21}
              />
            }
            className="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Open"
            value={openCount}
            icon={
              <AlertCircle size={21} />
            }
            className="bg-red-50 text-red-600"
          />

          <StatCard
            title="Pending"
            value={pendingCount}
            icon={
              <Clock3 size={21} />
            }
            className="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Resolved"
            value={resolvedCount}
            icon={
              <CheckCircle2
                size={21}
              />
            }
            className="bg-emerald-50 text-emerald-600"
          />

        </div>

        {/* ==================================================
            SEARCH / FILTER
            ================================================== */}

        <div className="mb-6 rounded-xl bg-white p-4 shadow">

          <div className="grid gap-3 md:grid-cols-[1fr_220px]">

            <div className="relative">

              <Search
                size={20}
                className="absolute left-3 top-3.5 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search by facility, description, ID or status..."
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              <option value="All">
                All Statuses
              </option>

              <option value="Open">
                Open
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Resolved">
                Resolved
              </option>

            </select>

          </div>

        </div>

        {/* ==================================================
            TABLE
            ================================================== */}

        <div className="overflow-hidden rounded-xl bg-white shadow">

          {loading ? (
            <div className="p-12 text-center">

              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-blue-600"
              />

              <p className="mt-3 font-medium text-slate-700">
                Loading complaints...
              </p>

            </div>
          ) : filteredComplaints.length ===
            0 ? (
            <div className="p-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <MessageSquareWarning
                  size={26}
                />
              </div>

              <p className="mt-4 text-lg font-semibold text-slate-700">
                No complaints found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try another search or add a
                new complaint.
              </p>

              <button
                onClick={handleAdd}
                disabled={
                  facilities.length === 0
                }
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus size={17} />
                Add Complaint
              </button>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-900 text-white">

                  <tr>

                    <th className="p-4 text-left">
                      ID
                    </th>

                    <th className="p-4 text-left">
                      Facility
                    </th>

                    <th className="p-4 text-left">
                      Description
                    </th>

                    <th className="p-4 text-left">
                      Status
                    </th>

                    <th className="p-4 text-left">
                      Date
                    </th>

                    <th className="p-4 text-center">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredComplaints.map(
                    (complaint) => (
                      <tr
                        key={complaint.id}
                        className="border-b last:border-b-0 hover:bg-slate-50"
                      >

                        {/* ID */}

                        <td className="p-4 font-semibold text-slate-900">
                          #{complaint.id}
                        </td>

                        {/* FACILITY */}

                        <td className="p-4">

                          <div className="flex items-center gap-2">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <Building2
                                size={17}
                              />
                            </div>

                            <div>

                              <p className="font-medium text-slate-800">
                                {complaint.facility_location ||
                                  `Facility #${complaint.facility_id}`}
                              </p>

                              <p className="text-xs text-slate-400">
                                ID #
                                {
                                  complaint.facility_id
                                }
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* DESCRIPTION */}

                        <td className="max-w-md p-4">

                          <p className="line-clamp-2 text-sm text-slate-600">
                            {complaint.description}
                          </p>

                        </td>

                        {/* STATUS */}

                        <td className="p-4">

                          <StatusBadge
                            status={
                              complaint.status
                            }
                          />

                        </td>

                        {/* DATE */}

                        <td className="p-4 text-sm text-slate-500">

                          {complaint.created_at
                            ? new Date(
                                complaint.created_at
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}

                        </td>

                        {/* ACTIONS */}

                        <td className="p-4">

                          <div className="flex justify-center gap-2">

                            <button
                              onClick={() =>
                                setViewingComplaint(
                                  complaint
                                )
                              }
                              title="View complaint"
                              className="rounded-lg bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200"
                            >
                              <Eye
                                size={17}
                              />
                            </button>

                            <button
                              onClick={() =>
                                handleEdit(
                                  complaint
                                )
                              }
                              title="Edit complaint"
                              className="rounded-lg bg-blue-100 p-2 text-blue-700 transition hover:bg-blue-200"
                            >
                              <Pencil
                                size={17}
                              />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  complaint.id
                                )
                              }
                              title="Delete complaint"
                              className="rounded-lg bg-red-100 p-2 text-red-700 transition hover:bg-red-200"
                            >
                              <Trash2
                                size={17}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* ==================================================
          ADD / EDIT MODAL
          ================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2 text-blue-600">

                  <MessageSquareWarning
                    size={20}
                  />

                  <span className="text-sm font-semibold">
                    Complaint Management
                  </span>

                </div>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {editingComplaint
                    ? "Edit Complaint"
                    : "Add Complaint"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the complaint details below.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* FACILITY */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Facility
                </label>

                <select
                  name="facility_id"
                  value={
                    form.facility_id
                  }
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                >

                  <option value={0}>
                    Select facility
                  </option>

                  {facilities.map(
                    (facility) => (
                      <option
                        key={facility.id}
                        value={facility.id}
                      >
                        #{facility.id} -{" "}
                        {facility.location}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Complaint Description
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe the problem or complaint..."
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />

              </div>

              {/* STATUS */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >

                  <option value="Open">
                    Open
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Resolved">
                    Resolved
                  </option>

                </select>

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingComplaint
                      ? "Update Complaint"
                      : "Add Complaint"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ==================================================
          VIEW MODAL
          ================================================== */}

      {viewingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">

            {/* HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2 text-blue-600">

                  <MessageSquareWarning
                    size={20}
                  />

                  <span className="text-sm font-semibold">
                    Complaint Details
                  </span>

                </div>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Complaint #
                  {viewingComplaint.id}
                </h2>

              </div>

              <button
                onClick={() =>
                  setViewingComplaint(null)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>

            </div>

            {/* DETAILS */}

            <div className="space-y-4">

              <DetailItem
                label="Complaint ID"
                value={`#${viewingComplaint.id}`}
              />

              <DetailItem
                label="Facility"
                value={
                  viewingComplaint.facility_location ||
                  `Facility #${viewingComplaint.facility_id}`
                }
              />

              <DetailItem
                label="Facility ID"
                value={`#${viewingComplaint.facility_id}`}
              />

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-sm text-slate-500">
                  Description
                </p>

                <p className="mt-2 leading-6 text-slate-800">
                  {
                    viewingComplaint.description
                  }
                </p>

              </div>

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="mb-2 text-sm text-slate-500">
                  Status
                </p>

                <StatusBadge
                  status={
                    viewingComplaint.status
                  }
                />

              </div>

              <DetailItem
                label="Created Date"
                value={
                  viewingComplaint.created_at
                    ? new Date(
                        viewingComplaint.created_at
                      ).toLocaleString(
                        "en-IN"
                      )
                    : "Not available"
                }
              />

            </div>

            {/* CLOSE */}

            <button
              onClick={() =>
                setViewingComplaint(null)
              }
              className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Close
            </button>

          </div>

        </div>
      )}

    </main>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({
  status,
}: {
  status: Complaint["status"];
}) {
  const config = {
    Open: {
      className:
        "bg-red-100 text-red-700",
      icon: <AlertCircle size={14} />,
    },

    Pending: {
      className:
        "bg-amber-100 text-amber-700",
      icon: <Clock3 size={14} />,
    },

    Resolved: {
      className:
        "bg-emerald-100 text-emerald-700",
      icon: (
        <CheckCircle2 size={14} />
      ),
    },
  };

  const current =
    config[status] || config.Open;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${current.className}`}
    >
      {current.icon}
      {status}
    </span>
  );
}

// ======================================================
// DETAIL ITEM
// ======================================================

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
}