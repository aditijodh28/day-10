"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  X,
} from "lucide-react";

type Facility = {
  id: number;
  location: string;
  cleanliness_score: number;
  odor_score: number;
  waste_level: number;
  water_availability: number;
  footfall: number;
  complaints: number;
  created_at?: string;
};

type FacilityForm = {
  location: string;
  cleanliness_score: number;
  odor_score: number;
  waste_level: number;
  water_availability: number;
  footfall: number;
  complaints: number;
};

const emptyForm: FacilityForm = {
  location: "",
  cleanliness_score: 0,
  odor_score: 0,
  waste_level: 0,
  water_availability: 0,
  footfall: 0,
  complaints: 0,
};

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingFacility, setEditingFacility] =
    useState<Facility | null>(null);

  const [viewingFacility, setViewingFacility] =
    useState<Facility | null>(null);

  const [form, setForm] = useState<FacilityForm>(emptyForm);

  const [saving, setSaving] = useState(false);

  // ==========================================
  // FETCH FACILITIES
  // ==========================================

  useEffect(() => {
    fetchFacilities();
  }, []);

  async function fetchFacilities() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/facilities");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to fetch facilities"
        );
      }

      setFacilities(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load facilities"
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // GET STATUS
  // ==========================================

  function getStatus(cleanliness: number) {
    if (cleanliness >= 70) {
      return "Good";
    }

    if (cleanliness >= 40) {
      return "Moderate";
    }

    return "Attention";
  }

  function getStatusClass(cleanliness: number) {
    if (cleanliness >= 70) {
      return "bg-green-100 text-green-700";
    }

    if (cleanliness >= 40) {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  }

  // ==========================================
  // ADD
  // ==========================================

  function handleAdd() {
    setEditingFacility(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  // ==========================================
  // EDIT
  // ==========================================

  function handleEdit(facility: Facility) {
    setEditingFacility(facility);

    setForm({
      location: facility.location || "",
      cleanliness_score: Number(
        facility.cleanliness_score || 0
      ),
      odor_score: Number(facility.odor_score || 0),
      waste_level: Number(facility.waste_level || 0),
      water_availability: Number(
        facility.water_availability || 0
      ),
      footfall: Number(facility.footfall || 0),
      complaints: Number(facility.complaints || 0),
    });

    setShowModal(true);
  }

  // ==========================================
  // FORM INPUT
  // ==========================================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement
    >
  ) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "location"
          ? value
          : Number(value),
    }));
  }

  // ==========================================
  // SAVE ADD / EDIT
  // ==========================================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!form.location.trim()) {
      alert("Please enter facility location.");
      return;
    }

    try {
      setSaving(true);

      const url = editingFacility
        ? `/api/facilities/${editingFacility.id}`
        : "/api/facilities";

      const method = editingFacility
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save facility"
        );
      }

      setShowModal(false);
      setEditingFacility(null);
      setForm(emptyForm);

      await fetchFacilities();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save facility"
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // DELETE
  // ==========================================

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this facility?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/facilities/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete facility"
        );
      }

      setFacilities((previous) =>
        previous.filter(
          (facility) =>
            facility.id !== id
        )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete facility"
      );
    }
  }

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredFacilities =
    facilities.filter((facility) => {
      const searchText =
        search.toLowerCase().trim();

      const id = String(
        facility.id || ""
      ).toLowerCase();

      const location = String(
        facility.location || ""
      ).toLowerCase();

      const cleanliness = String(
        facility.cleanliness_score || ""
      ).toLowerCase();

      const status = getStatus(
        Number(
          facility.cleanliness_score || 0
        )
      ).toLowerCase();

      return (
        id.includes(searchText) ||
        location.includes(searchText) ||
        cleanliness.includes(searchText) ||
        status.includes(searchText)
      );
    });

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Facilities
            </h1>

            <p className="mt-1 text-slate-500">
              Manage and monitor all registered facilities.
            </p>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow hover:bg-blue-700"
          >
            <Plus size={20} />

            Add Facility
          </button>
        </div>

        {/* SEARCH */}

        <div className="mb-6 rounded-xl bg-white p-4 shadow">

          <div className="relative">

            <Search
              size={20}
              className="absolute left-3 top-3.5 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by ID, location, score or status..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* TABLE */}

        <div className="overflow-hidden rounded-xl bg-white shadow">

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading facilities...
            </div>
          ) : filteredFacilities.length === 0 ? (
            <div className="p-10 text-center">

              <p className="text-lg font-medium text-slate-700">
                No facilities found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try another search or add a new facility.
              </p>

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
                      Location
                    </th>

                    <th className="p-4 text-left">
                      Cleanliness
                    </th>

                    <th className="p-4 text-left">
                      Odor
                    </th>

                    <th className="p-4 text-left">
                      Waste
                    </th>

                    <th className="p-4 text-left">
                      Water
                    </th>

                    <th className="p-4 text-left">
                      Footfall
                    </th>

                    <th className="p-4 text-left">
                      Complaints
                    </th>

                    <th className="p-4 text-left">
                      Status
                    </th>

                    <th className="p-4 text-center">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredFacilities.map(
                    (facility) => {
                      const status = getStatus(
                        Number(
                          facility.cleanliness_score || 0
                        )
                      );

                      return (
                        <tr
                          key={facility.id}
                          className="border-b last:border-b-0 hover:bg-slate-50"
                        >

                          {/* ID */}

                          <td className="p-4 font-semibold text-slate-900">
                            #{facility.id}
                          </td>

                          {/* LOCATION */}

                          <td className="p-4">

                            <div className="flex items-center gap-2 text-slate-700">

                              <MapPin
                                size={16}
                                className="text-blue-600"
                              />

                              {facility.location ||
                                "Unknown"}

                            </div>

                          </td>

                          {/* CLEANLINESS */}

                          <td className="p-4">

                            <div className="flex items-center gap-2">

                              <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">

                                <div
                                  className="h-full bg-blue-600"
                                  style={{
                                    width: `${Math.min(
                                      Math.max(
                                        Number(
                                          facility.cleanliness_score ||
                                            0
                                        ),
                                        0
                                      ),
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                              <span className="text-sm font-medium">
                                {Number(
                                  facility.cleanliness_score ||
                                    0
                                )}
                                %
                              </span>

                            </div>

                          </td>

                          {/* ODOR */}

                          <td className="p-4 text-slate-600">
                            {Number(
                              facility.odor_score || 0
                            )}
                          </td>

                          {/* WASTE */}

                          <td className="p-4 text-slate-600">
                            {Number(
                              facility.waste_level || 0
                            )}
                          </td>

                          {/* WATER */}

                          <td className="p-4 text-slate-600">
                            {Number(
                              facility.water_availability ||
                                0
                            )}
                          </td>

                          {/* FOOTFALL */}

                          <td className="p-4 text-slate-600">
                            {Number(
                              facility.footfall || 0
                            )}
                          </td>

                          {/* COMPLAINTS */}

                          <td className="p-4 text-slate-600">
                            {Number(
                              facility.complaints || 0
                            )}
                          </td>

                          {/* STATUS */}

                          <td className="p-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                Number(
                                  facility.cleanliness_score ||
                                    0
                                )
                              )}`}
                            >
                              {status}
                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td className="p-4">

                            <div className="flex justify-center gap-2">

                              {/* SHOW */}

                              <button
                                onClick={() =>
                                  setViewingFacility(
                                    facility
                                  )
                                }
                                title="View"
                                className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                              >
                                <Eye size={17} />
                              </button>

                              {/* EDIT */}

                              <button
                                onClick={() =>
                                  handleEdit(
                                    facility
                                  )
                                }
                                title="Edit"
                                className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200"
                              >
                                <Pencil size={17} />
                              </button>

                              {/* DELETE */}

                              <button
                                onClick={() =>
                                  handleDelete(
                                    facility.id
                                  )
                                }
                                title="Delete"
                                className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200"
                              >
                                <Trash2 size={17} />
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* ======================================
          ADD / EDIT MODAL
          ====================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingFacility
                    ? "Edit Facility"
                    : "Add Facility"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter facility hygiene information.
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

              {/* LOCATION */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Enter location"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  required
                />

              </div>

              {/* SCORES */}

              <div className="grid gap-4 md:grid-cols-2">

                {/* CLEANLINESS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Cleanliness Score
                  </label>

                  <input
                    type="number"
                    name="cleanliness_score"
                    min="0"
                    max="100"
                    value={
                      form.cleanliness_score
                    }
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                {/* ODOR */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Odor Score
                  </label>

                  <input
                    type="number"
                    name="odor_score"
                    min="0"
                    max="100"
                    value={form.odor_score}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                {/* WASTE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Waste Level
                  </label>

                  <input
                    type="number"
                    name="waste_level"
                    min="0"
                    max="100"
                    value={form.waste_level}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                {/* WATER */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Water Availability
                  </label>

                  <input
                    type="number"
                    name="water_availability"
                    min="0"
                    max="100"
                    value={
                      form.water_availability
                    }
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                {/* FOOTFALL */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Footfall
                  </label>

                  <input
                    type="number"
                    name="footfall"
                    min="0"
                    value={form.footfall}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                {/* COMPLAINTS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Complaints
                  </label>

                  <input
                    type="number"
                    name="complaints"
                    min="0"
                    value={form.complaints}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-4">

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
                    : editingFacility
                      ? "Update Facility"
                      : "Add Facility"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ======================================
          VIEW MODAL
          ====================================== */}

      {viewingFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">

            {/* HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Facility Details
                </h2>

                <p className="text-sm text-slate-500">
                  Facility #{viewingFacility.id}
                </p>
              </div>

              <button
                onClick={() =>
                  setViewingFacility(null)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>

            </div>

            {/* DETAILS */}

            <div className="space-y-3">

              <Detail
                label="Facility ID"
                value={`#${viewingFacility.id}`}
              />

              <Detail
                label="Location"
                value={
                  viewingFacility.location ||
                  "Unknown"
                }
              />

              <Detail
                label="Cleanliness Score"
                value={`${Number(
                  viewingFacility.cleanliness_score ||
                    0
                )}%`}
              />

              <Detail
                label="Odor Score"
                value={String(
                  Number(
                    viewingFacility.odor_score ||
                      0
                  )
                )}
              />

              <Detail
                label="Waste Level"
                value={String(
                  Number(
                    viewingFacility.waste_level ||
                      0
                  )
                )}
              />

              <Detail
                label="Water Availability"
                value={`${Number(
                  viewingFacility.water_availability ||
                    0
                )}%`}
              />

              <Detail
                label="Footfall"
                value={String(
                  Number(
                    viewingFacility.footfall ||
                      0
                  )
                )}
              />

              <Detail
                label="Complaints"
                value={String(
                  Number(
                    viewingFacility.complaints ||
                      0
                  )
                )}
              />

              <div className="rounded-lg bg-slate-50 p-4">

                <p className="text-sm text-slate-500">
                  Status
                </p>

                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    Number(
                      viewingFacility.cleanliness_score ||
                        0
                    )
                  )}`}
                >
                  {getStatus(
                    Number(
                      viewingFacility.cleanliness_score ||
                        0
                    )
                  )}
                </span>

              </div>

            </div>

            {/* CLOSE */}

            <button
              onClick={() =>
                setViewingFacility(null)
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

// ==========================================
// DETAIL COMPONENT
// ==========================================

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
}