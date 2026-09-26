import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// ======================================================
// GET ALL COMPLAINTS
// ======================================================

export async function GET() {
  try {
    const complaints = await sql(`
      SELECT
        c.id,
        c.facility_id,
        f.location AS facility_location,
        c.description,
        c.status,
        c.created_at
      FROM complaints c
      LEFT JOIN facilities f
        ON c.facility_id = f.id
      ORDER BY c.id DESC
    `);

    return NextResponse.json(complaints);
  } catch (error) {
    console.error("Complaints GET error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch complaints",
      },
      { status: 500 }
    );
  }
}

// ======================================================
// CREATE COMPLAINT
// ======================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("POST /api/complaints body:", body);

    const {
      facility_id,
      description,
      status,
    } = body;

    // Validate facility
    if (
      facility_id === undefined ||
      facility_id === null ||
      facility_id === ""
    ) {
      return NextResponse.json(
        {
          error: "Facility is required",
        },
        { status: 400 }
      );
    }

    // Validate description
    if (
      !description ||
      !String(description).trim()
    ) {
      return NextResponse.json(
        {
          error: "Complaint description is required",
        },
        { status: 400 }
      );
    }

    // Validate status
    const allowedStatuses = [
      "Open",
      "Pending",
      "Resolved",
    ];

    const complaintStatus =
      status && allowedStatuses.includes(status)
        ? status
        : "Open";

    // Check facility exists
    const facility = await sql(
      `
      SELECT id
      FROM facilities
      WHERE id = $1
      `,
      [Number(facility_id)]
    );

    if (facility.length === 0) {
      return NextResponse.json(
        {
          error: "Selected facility does not exist",
        },
        { status: 400 }
      );
    }

    // Insert complaint
    const complaints = await sql(
      `
      INSERT INTO complaints
      (
        facility_id,
        description,
        status
      )
      VALUES
      (
        $1,
        $2,
        $3
      )
      RETURNING *
      `,
      [
        Number(facility_id),
        String(description).trim(),
        complaintStatus,
      ]
    );

    return NextResponse.json(
      complaints[0],
      { status: 201 }
    );
  } catch (error) {
    console.error("Complaints POST error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create complaint",
      },
      { status: 500 }
    );
  }
}