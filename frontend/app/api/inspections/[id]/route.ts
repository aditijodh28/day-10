import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET ONE INSPECTION
export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const inspections = await sql(
      `
      SELECT
        i.id,
        i.facility_id,
        f.location AS facility_location,
        i.cleanliness_score,
        i.odor_score,
        i.waste_level,
        i.water_availability,
        i.footfall,
        i.complaints,
        i.inspection_date,
        i.created_at
      FROM inspections i
      INNER JOIN facilities f
        ON i.facility_id = f.id
      WHERE i.id = $1
      `,
      [Number(id)]
    );

    if (inspections.length === 0) {
      return NextResponse.json(
        {
          error: "Inspection not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(inspections[0]);
  } catch (error) {
    console.error("Inspection GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch inspection",
      },
      {
        status: 500,
      }
    );
  }
}

// UPDATE INSPECTION
export async function PUT(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const {
      facility_id,
      cleanliness_score,
      odor_score,
      waste_level,
      water_availability,
      footfall,
      complaints,
      inspection_date,
    } = body;

    if (!facility_id) {
      return NextResponse.json(
        {
          error: "Facility is required",
        },
        {
          status: 400,
        }
      );
    }

    const inspections = await sql(
      `
      UPDATE inspections
      SET
        facility_id = $1,
        cleanliness_score = $2,
        odor_score = $3,
        waste_level = $4,
        water_availability = $5,
        footfall = $6,
        complaints = $7,
        inspection_date = $8
      WHERE id = $9
      RETURNING *
      `,
      [
        Number(facility_id),
        Number(cleanliness_score || 0),
        Number(odor_score || 0),
        Number(waste_level || 0),
        Number(water_availability || 0),
        Number(footfall || 0),
        Number(complaints || 0),
        inspection_date,
        Number(id),
      ]
    );

    if (inspections.length === 0) {
      return NextResponse.json(
        {
          error: "Inspection not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(inspections[0]);
  } catch (error) {
    console.error("Inspection PUT error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update inspection",
      },
      {
        status: 500,
      }
    );
  }
}

// DELETE INSPECTION
export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const inspections = await sql(
      `
      DELETE FROM inspections
      WHERE id = $1
      RETURNING *
      `,
      [Number(id)]
    );

    if (inspections.length === 0) {
      return NextResponse.json(
        {
          error: "Inspection not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      message: "Inspection deleted successfully",
    });
  } catch (error) {
    console.error("Inspection DELETE error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete inspection",
      },
      {
        status: 500,
      }
    );
  }
}