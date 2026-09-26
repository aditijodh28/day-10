import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// ==========================================
// GET ALL FACILITIES
// ==========================================

export async function GET() {
  try {
    const facilities = await sql(
      "SELECT * FROM facilities ORDER BY id DESC"
    );

    return NextResponse.json(facilities);
  } catch (error) {
    console.error("Facilities GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch facilities",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// ADD FACILITY
// ==========================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("POST /api/facilities body:", body);

    const {
      location,
      cleanliness_score,
      odor_score,
      waste_level,
      water_availability,
      footfall,
      complaints,
    } = body;

    // Validate location
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
      INSERT INTO facilities
      (
        location,
        cleanliness_score,
        odor_score,
        waste_level,
        water_availability,
        footfall,
        complaints
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
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
      ]
    );

    return NextResponse.json(
      facilities[0],
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Facilities POST error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to add facility",
      },
      {
        status: 500,
      }
    );
  }
}