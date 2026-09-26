"use client";

import { useEffect, useState } from "react";

type Facility = {
  id?: number;
  name: string;
  location: string;
  type: string;
  cleanliness_score: number;
  status: string;
};

type Props = {
  facility: Facility | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function FacilityModal({
  facility,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState<Facility>({
    name: "",
    location: "",
    type: "",
    cleanliness_score: 0,
    status: "Active",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(facility);

  useEffect(() => {
    if (facility) {
      setForm(facility);
    }
  }, [facility]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "cleanliness_score"
          ? Number(value)
          : value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Facility name is required.");
      return;
    }

    if (!form.location.trim()) {
      setError("Location is required.");
      return;
    }

    if (!form.type.trim()) {
      setError("Facility type is required.");
      return;
    }

    if (
      form.cleanliness_score < 0 ||
      form.cleanliness_score > 100
    ) {
      setError(
        "Cleanliness score must be between 0 and 100."
      );
      return;
    }

    try {
      setLoading(true);

      const url = isEditing
        ? `/api/facilities/${facility?.id}`
        : "/api/facilities";

      const method = isEditing ? "PUT" : "POST";

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
          data.error || "Something went wrong"
        );
      }

      onSaved();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save facility"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold text-slate-900">
            {isEditing
              ? "Edit Facility"
              : "Add New Facility"}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-slate-500 hover:text-slate-900"
          >
            ×
          </button>

        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>
            <label className="mb-1 block text-sm font-medium">
              Facility Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter facility name"
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Location
            </label>

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Enter location"
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Facility Type
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 p-3"
            >
              <option value="">
                Select type
              </option>
              <option value="Public Toilet">
                Public Toilet
              </option>
              <option value="Hospital">
                Hospital
              </option>
              <option value="Transport">
                Transport
              </option>
              <option value="Community">
                Community
              </option>
              <option value="School">
                School
              </option>
              <option value="Other">
                Other
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Cleanliness Score
            </label>

            <input
              type="number"
              name="cleanliness_score"
              min="0"
              max="100"
              value={form.cleanliness_score}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 p-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 p-3"
            >
              <option value="Active">
                Active
              </option>

              <option value="Maintenance">
                Maintenance
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-medium hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Facility"
                  : "Add Facility"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}