import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// ==========================================
// GET ONE FACILITY
// ==========================================

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const facilityId = Number(id);

    if (!Number.isInteger(facilityId)) {
      return NextResponse.json(
        {
          error: "Invalid facility ID",
        },
        {
          status: 400,
        }
      );
    }

    const facilities = await sql(
      "SELECT * FROM facilities WHERE id = $1",
      [facilityId]
    );

    if (facilities.length === 0) {
      return NextResponse.json(
        {
          error: "Facility not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(facilities[0]);
  } catch (error) {
    console.error("Facility GET error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch facility",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// UPDATE FACILITY
// ==========================================

export async function PUT(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const facilityId = Number(id);

    if (!Number.isInteger(facilityId)) {
      return NextResponse.json(
        {
          error: "Invalid facility ID",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const {
      location,
      cleanliness_score,
      odor_score,
      waste_level,
      water_availability,
      footfall,
      complaints,
    } = body;

    if (!location || !String(location).trim()) {
      return NextResponse.json(
        {
          error: "Location is required",
        },
        {
          status: 400,
        }
      );
    }

    const facilities = await sql(
      `
      UPDATE facilities
      SET
        location = $1,
        cleanliness_score = $2,
        odor_score = $3,
        waste_level = $4,
        water_availability = $5,
        footfall = $6,
        complaints = $7
      WHERE id = $8
      RETURNING *
      `,
      [
        String(location).trim(),
        Number(cleanliness_score || 0),
        Number(odor_score || 0),
        Number(waste_level || 0),
        Number(water_availability || 0),
        Number(footfall || 0),
        Number(complaints || 0),
        facilityId,
      ]
    );

    if (facilities.length === 0) {
      return NextResponse.json(
        {
          error: "Facility not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(facilities[0]);
  } catch (error) {
    console.error("Facility PUT error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update facility",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// DELETE FACILITY
// ==========================================

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const facilityId = Number(id);

    if (!Number.isInteger(facilityId)) {
      return NextResponse.json(
        {
          error: "Invalid facility ID",
        },
        {
          status: 400,
        }
      );
    }

    const facilities = await sql(
      `
      DELETE FROM facilities
      WHERE id = $1
      RETURNING *
      `,
      [facilityId]
    );

    if (facilities.length === 0) {
      return NextResponse.json(
        {
          error: "Facility not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      message: "Facility deleted successfully",
      facility: facilities[0],
    });
  } catch (error) {
    console.error("Facility DELETE error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete facility",
      },
      {
        status: 500,
      }
    );
  }
}