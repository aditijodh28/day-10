import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// ======================================================
// GET SINGLE COMPLAINT
// ======================================================

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const complaintId = Number(id);

    if (!Number.isInteger(complaintId)) {
      return NextResponse.json(
        {
          error: "Invalid complaint ID",
        },
        { status: 400 }
      );
    }

    const complaints = await sql(
      `
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
      WHERE c.id = $1
      `,
      [complaintId]
    );

    if (complaints.length === 0) {
      return NextResponse.json(
        {
          error: "Complaint not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(complaints[0]);
  } catch (error) {
    console.error(
      "Complaint GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch complaint",
      },
      { status: 500 }
    );
  }
}

// ======================================================
// UPDATE COMPLAINT
// ======================================================

export async function PUT(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const complaintId = Number(id);

    if (!Number.isInteger(complaintId)) {
      return NextResponse.json(
        {
          error: "Invalid complaint ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

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

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error:
            "Status must be Open, Pending or Resolved",
        },
        { status: 400 }
      );
    }

    // Check facility
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

    // Update
    const complaints = await sql(
      `
      UPDATE complaints
      SET
        facility_id = $1,
        description = $2,
        status = $3
      WHERE id = $4
      RETURNING *
      `,
      [
        Number(facility_id),
        String(description).trim(),
        status,
        complaintId,
      ]
    );

    if (complaints.length === 0) {
      return NextResponse.json(
        {
          error: "Complaint not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      complaints[0]
    );
  } catch (error) {
    console.error(
      "Complaint PUT error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update complaint",
      },
      { status: 500 }
    );
  }
}

// ======================================================
// DELETE COMPLAINT
// ======================================================

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    const complaintId = Number(id);

    if (!Number.isInteger(complaintId)) {
      return NextResponse.json(
        {
          error: "Invalid complaint ID",
        },
        { status: 400 }
      );
    }

    const complaints = await sql(
      `
      DELETE FROM complaints
      WHERE id = $1
      RETURNING *
      `,
      [complaintId]
    );

    if (complaints.length === 0) {
      return NextResponse.json(
        {
          error: "Complaint not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message:
        "Complaint deleted successfully",
      complaint: complaints[0],
    });
  } catch (error) {
    console.error(
      "Complaint DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete complaint",
      },
      { status: 500 }
    );
  }
}