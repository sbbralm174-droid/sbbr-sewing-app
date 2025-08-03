// src/app/api/operators/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Operator from '@/models/Operator';

// GET /api/operators/[id] - Fetch a single operator's details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const { id } = params; // The operator's _id

    const operator = await Operator.findById(id)
      .populate('skills.machines', 'name') // Populate machine names
      .populate('skills.processes', 'name'); // Populate process names

    if (!operator) {
      return NextResponse.json({ message: 'Operator not found.' }, { status: 404 });
    }

    return NextResponse.json(operator, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching operator:', error);
    return NextResponse.json({ message: 'Failed to fetch operator.', error: error.message }, { status: 500 });
  }
}

// You might also want PUT/DELETE for individual operator management here later
// export async function PUT(...) { ... }
// export async function DELETE(...) { ... }