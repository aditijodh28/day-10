"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from "lucide-react";

type Facility = {
  id: number;
  location: string;
};

type Inspection = {
  id: number;
  facility_id: number;
  facility_location?: string;
  cleanliness_score: number;
  odor_score: number;
  waste_level: number;
  water_availability: number;
  footfall: number;
  complaints: number;
  inspection_date?: string;
  created_at?: string;
};

type FormData = {
  facility_id: string;
  cleanliness_score: string;
  odor_score: string;
  waste_level: string;
  water_availability: string;
  footfall: string;
  complaints: string;
  inspection_date: string;
};

const emptyForm: FormData = {
  facility_id: "",
  cleanliness_score: "",
  odor_score: "",
  waste_level: "",
  water_availability: "",
  footfall: "",
  complaints: "",
  inspection_date: new Date().toISOString().split("T")[0],
};

function getHealthStatus(score: number) {
  if (score >= 80) {
    return {
      label: "Healthy",
      className: "bg-green-100 text-green-700",
      icon: CheckCircle2,
    };
  }

  if (score >= 70) {
    return {
      label: "Moderate",
      className: "bg-yellow-100 text-yellow-700",
      icon: AlertTriangle,
    };
  }

  return {
    label: "Attention",
    className: "bg-red-100 text-red-700",
    icon: XCircle,
  };
}

function getScoreClass(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 70) return "text-yellow-600";
  return "text-red-600";
}

function formatDate(date?: string) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedInspection, setSelectedInspection] =
    useState<Inspection | null>(null);

  const [form, setForm] = useState<FormData>(emptyForm);

  async function loadData() {
    try {
      setLoading(true);

      const [inspectionResponse, facilityResponse] = await Promise.all([
        fetch("/api/inspections"),
        fetch("/api/facilities"),
      ]);

      const inspectionData = await inspectionResponse.json();
      const facilityData = await facilityResponse.json();

      if (!inspectionResponse.ok) {
        throw new Error(
          inspectionData.error || "Failed to fetch inspections"
        );
      }

      if (!facilityResponse.ok) {
        throw new Error(
          facilityData.error || "Failed to fetch facilities"
        );
      }

      setInspections(Array.isArray(inspectionData) ? inspectionData : []);
      setFacilities(Array.isArray(facilityData) ? facilityData : []);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load inspection data"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredInspections = useMemo(() => {
    return inspections.filter((inspection) => {
      const location = String(
        inspection.facility_location || ""
      ).toLowerCase();

      const searchText = search.toLowerCase();

      const matchesSearch =
        location.includes(searchText) ||
        String(inspection.id).includes(searchText) ||
        String(inspection.cleanliness_score).includes(searchText);

      const status = getHealthStatus(
        Number(inspection.cleanliness_score)
      ).label;

      const matchesHealth =
        healthFilter === "All" || status === healthFilter;

      return matchesSearch && matchesHealth;
    });
  }, [inspections, search, healthFilter]);

  const healthyCount = inspections.filter(
    (item) => Number(item.cleanliness_score) >= 80
  ).length;

  const moderateCount = inspections.filter(
    (item) =>
      Number(item.cleanliness_score) >= 70 &&
      Number(item.cleanliness_score) < 80
  ).length;

  const attentionCount = inspections.filter(
    (item) => Number(item.cleanliness_score) < 70
  ).length;

  function openAddForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      inspection_date: new Date().toISOString().split("T")[0],
    });
    setShowForm(true);
  }

  function openEditForm(inspection: Inspection) {
    setEditingId(inspection.id);

    setForm({
      facility_id: String(inspection.facility_id),
      cleanliness_score: String(inspection.cleanliness_score ?? ""),
      odor_score: String(inspection.odor_score ?? ""),
      waste_level: String(inspection.waste_level ?? ""),
      water_availability: String(
        inspection.water_availability ?? ""
      ),
      footfall: String(inspection.footfall ?? ""),
      complaints: String(inspection.complaints ?? ""),
      inspection_date: inspection.inspection_date
        ? inspection.inspection_date.substring(0, 10)
        : new Date().toISOString().split("T")[0],
    });

    setShowForm(true);
  }

  function openView(inspection: Inspection) {
    setSelectedInspection(inspection);
    setShowView(true);
  }

  async function saveInspection(e: React.FormEvent) {
    e.preventDefault();

    if (!form.facility_id) {
      alert("Please select a facility.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        facility_id: Number(form.facility_id),
        cleanliness_score: Number(form.cleanliness_score || 0),
        odor_score: Number(form.odor_score || 0),
        waste_level: Number(form.waste_level || 0),
        water_availability: Number(
          form.water_availability || 0
        ),
        footfall: Number(form.footfall || 0),
        complaints: Number(form.complaints || 0),
        inspection_date: form.inspection_date,
      };

      const url = editingId
        ? `/api/inspections/${editingId}`
        : "/api/inspections";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save inspection"
        );
      }

      alert(
        editingId
          ? "Inspection updated successfully."
          : "Inspection added successfully."
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save inspection"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteInspection(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inspection?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/inspections/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete inspection"
        );
      }

      alert("Inspection deleted successfully.");

      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete inspection"
      );
    }
  }

  function updateField(
    field: keyof FormData,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-3 text-white shadow-lg">
              <ClipboardCheck size={25} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Inspections
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage facility hygiene inspections and health scores.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add Inspection
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm font-medium text-slate-500">
            Total Inspections
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-800">
            {inspections.length}
          </p>
        </div>

        <div className="rounded-2xl bg-green-50 p-5 shadow-sm ring-1 ring-green-100">
          <p className="text-sm font-medium text-green-700">
            Healthy
          </p>

          <p className="mt-2 text-3xl font-bold text-green-700">
            {healthyCount}
          </p>
        </div>

        <div className="rounded-2xl bg-yellow-50 p-5 shadow-sm ring-1 ring-yellow-100">
          <p className="text-sm font-medium text-yellow-700">
            Moderate
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-700">
            {moderateCount}
          </p>
        </div>

        <div className="rounded-2xl bg-red-50 p-5 shadow-sm ring-1 ring-red-100">
          <p className="text-sm font-medium text-red-700">
            Attention Required
          </p>

          <p className="mt-2 text-3xl font-bold text-red-700">
            {attentionCount}
          </p>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by facility, inspection ID or cleanliness score..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500"
          >
            <option value="All">All Status</option>
            <option value="Healthy">Healthy</option>
            <option value="Moderate">Moderate</option>
            <option value="Attention">Attention</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full">
            <thead className="bg-slate-100">
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">Facility</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Cleanliness</th>
                <th className="px-5 py-4">Odor</th>
                <th className="px-5 py-4">Waste</th>
                <th className="px-5 py-4">Water</th>
                <th className="px-5 py-4">Footfall</th>
                <th className="px-5 py-4">Complaints</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading inspections...
                  </td>
                </tr>
              ) : filteredInspections.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-12 text-center"
                  >
                    <ClipboardCheck
                      size={40}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="font-semibold text-slate-600">
                      No inspections found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Add a new inspection or change your search.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInspections.map((inspection) => {
                  const health = getHealthStatus(
                    Number(inspection.cleanliness_score)
                  );

                  const HealthIcon = health.icon;

                  return (
                    <tr
                      key={inspection.id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* FACILITY */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {inspection.facility_location ||
                              `Facility #${inspection.facility_id}`}
                          </p>

                          <p className="text-xs text-slate-400">
                            Inspection #{inspection.id}
                          </p>
                        </div>
                      </td>

                      {/* DATE */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(
                          inspection.inspection_date
                        )}
                      </td>

                      {/* CLEANLINESS */}
                      <td className="px-5 py-4">
                        <span
                          className={`font-bold ${getScoreClass(
                            Number(
                              inspection.cleanliness_score
                            )
                          )}`}
                        >
                          {inspection.cleanliness_score}
                        </span>
                      </td>

                      {/* ODOR */}
                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        {inspection.odor_score}
                      </td>

                      {/* WASTE */}
                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        {inspection.waste_level}
                      </td>

                      {/* WATER */}
                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        {inspection.water_availability}
                      </td>

                      {/* FOOTFALL */}
                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        {inspection.footfall}
                      </td>

                      {/* COMPLAINTS */}
                      <td className="px-5 py-4 text-sm font-medium text-slate-600">
                        {inspection.complaints}
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${health.className}`}
                        >
                          <HealthIcon size={14} />
                          {health.label}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              openView(inspection)
                            }
                            title="View"
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() =>
                              openEditForm(inspection)
                            }
                            title="Edit"
                            className="rounded-lg border border-blue-100 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() =>
                              deleteInspection(inspection.id)
                            }
                            title="Delete"
                            className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingId
                    ? "Edit Inspection"
                    : "Add Inspection"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the facility inspection details.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={saveInspection}
              className="p-6"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* FACILITY */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Facility
                  </label>

                  <select
                    value={form.facility_id}
                    onChange={(e) =>
                      updateField(
                        "facility_id",
                        e.target.value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">
                      Select Facility
                    </option>

                    {facilities.map((facility) => (
                      <option
                        key={facility.id}
                        value={facility.id}
                      >
                        {facility.location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DATE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Inspection Date
                  </label>

                  <input
                    type="date"
                    value={form.inspection_date}
                    onChange={(e) =>
                      updateField(
                        "inspection_date",
                        e.target.value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* CLEANLINESS */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Cleanliness Score
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.cleanliness_score}
                    onChange={(e) =>
                      updateField(
                        "cleanliness_score",
                        e.target.value
                      )
                    }
                    placeholder="0 - 100"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* ODOR */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Odor Score
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.odor_score}
                    onChange={(e) =>
                      updateField(
                        "odor_score",
                        e.target.value
                      )
                    }
                    placeholder="0 - 100"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* WASTE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Waste Level
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.waste_level}
                    onChange={(e) =>
                      updateField(
                        "waste_level",
                        e.target.value
                      )
                    }
                    placeholder="0 - 100"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* WATER */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Water Availability
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.water_availability}
                    onChange={(e) =>
                      updateField(
                        "water_availability",
                        e.target.value
                      )
                    }
                    placeholder="0 - 100"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* FOOTFALL */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Footfall
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.footfall}
                    onChange={(e) =>
                      updateField(
                        "footfall",
                        e.target.value
                      )
                    }
                    placeholder="Number of visitors"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* COMPLAINTS */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Complaints
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.complaints}
                    onChange={(e) =>
                      updateField(
                        "complaints",
                        e.target.value
                      )
                    }
                    placeholder="Number of complaints"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* BUTTONS */}
              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Inspection"
                    : "Add Inspection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showView && selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Inspection Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Inspection #{selectedInspection.id}
                </p>
              </div>

              <button
                onClick={() => setShowView(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* FACILITY + STATUS */}
              <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm text-slate-500">
                    Facility
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-800">
                    {selectedInspection.facility_location ||
                      `Facility #${selectedInspection.facility_id}`}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(
                      selectedInspection.inspection_date
                    )}
                  </p>
                </div>

                {(() => {
                  const health = getHealthStatus(
                    Number(
                      selectedInspection.cleanliness_score
                    )
                  );

                  const HealthIcon = health.icon;

                  return (
                    <span
                      className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${health.className}`}
                    >
                      <HealthIcon size={17} />
                      {health.label}
                    </span>
                  );
                })()}
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <DetailCard
                  label="Cleanliness"
                  value={selectedInspection.cleanliness_score}
                  score
                />

                <DetailCard
                  label="Odor"
                  value={selectedInspection.odor_score}
                />

                <DetailCard
                  label="Waste Level"
                  value={selectedInspection.waste_level}
                />

                <DetailCard
                  label="Water Availability"
                  value={
                    selectedInspection.water_availability
                  }
                />

                <DetailCard
                  label="Footfall"
                  value={selectedInspection.footfall}
                />

                <DetailCard
                  label="Complaints"
                  value={selectedInspection.complaints}
                />
              </div>

              {/* CLOSE */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowView(false)}
                  className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailCard({
  label,
  value,
  score = false,
}: {
  label: string;
  value: number | string;
  score?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${
          score
            ? getScoreClass(Number(value))
            : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}