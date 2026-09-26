import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET ALL INSPECTIONS
export async function GET() {
  try {
    const inspections = await sql(`
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
      ORDER BY i.id DESC
    `);

    return NextResponse.json(inspections);
  } catch (error) {
    console.error("Inspections GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch inspections",
      },
      {
        status: 500,
      }
    );
  }
}

// ADD INSPECTION
export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("POST /api/inspections body:", body);

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
      INSERT INTO inspections
      (
        facility_id,
        cleanliness_score,
        odor_score,
        waste_level,
        water_availability,
        footfall,
        complaints,
        inspection_date
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )
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
        inspection_date || new Date().toISOString().split("T")[0],
      ]
    );

    return NextResponse.json(inspections[0], {
      status: 201,
    });
  } catch (error) {
    console.error("Inspections POST error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to add inspection",
      },
      {
        status: 500,
      }
    );
  }
}