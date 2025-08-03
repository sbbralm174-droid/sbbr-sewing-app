// src/app/api/operators/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Operator from '@/models/Operator';
import Machine from '@/models/Machine'; // Needed for type checking / existence check if strict
import Process from '@/models/Process'; // Needed for type checking / existence check if strict

export async function POST(req: Request) {
  await dbConnect();

  try {
    const {
      operatorId,
      name,
      contactNumber,
      selectedMachineIds, // Array of ObjectId strings
      selectedProcessIds // Array of ObjectId strings
    }: {
      operatorId: string;
      name: string;
      contactNumber?: string;
      selectedMachineIds: string[];
      selectedProcessIds: string[];
    } = await req.json();

    // Basic validation
    if (!operatorId || !name || !selectedMachineIds || !selectedProcessIds) {
      return NextResponse.json({ message: 'Operator ID, name, machines, and processes are required.' }, { status: 400 });
    }

    // Optional: Validate if the provided IDs actually exist in the DB (more robust)
    // For brevity, we'll assume valid IDs from frontend for now.
    // In a production app, you might do:
    // const existingMachines = await Machine.find({ _id: { $in: selectedMachineIds } });
    // if (existingMachines.length !== selectedMachineIds.length) { ... error }

    const newOperator = await Operator.create({
      operatorId,
      name,
      contactNumber,
      skills: {
        machines: selectedMachineIds,
        processes: selectedProcessIds,
      },
      isActive: true, // Default to active when created
    });

    return NextResponse.json({
      message: 'Operator added successfully!',
      data: newOperator
    }, { status: 201 });

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Operator ID already exists. Please use a different one.' }, { status: 409 });
    }
    console.error('Error adding operator:', error);
    return NextResponse.json({ message: 'Failed to add operator.', error: error.message }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();

  try {
    // Populate the 'machines' and 'processes' fields to get their full details, not just IDs
    const operators = await Operator.find({})
      .populate('skills.machines')
      .populate('skills.processes');

    return NextResponse.json(operators, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching operators:', error);
    return NextResponse.json({ message: 'Failed to fetch operators.', error: error.message }, { status: 500 });
  }
}