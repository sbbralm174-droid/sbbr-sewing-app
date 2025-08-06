// src/app/api/unique-machines/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UniqueMachine from '@/models/UniqueMachine';
import Machine from '@/models/Machine';

// POST method to create a new unique machine
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { machineType, uniqueId, floor, line } = body;

    if (!machineType || !uniqueId || !floor || !line) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    // Check if the machineType exists in the database
    const existingMachine = await Machine.findById(machineType);
    if (!existingMachine) {
      return NextResponse.json({ message: 'Invalid machine type.' }, { status: 404 });
    }

    const newUniqueMachine = new UniqueMachine({
      machineType,
      uniqueId,
      floor,
      line,
    });
    await newUniqueMachine.save();

    return NextResponse.json(newUniqueMachine, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A machine with this unique ID already exists.' }, { status: 409 });
    }
    console.error('Error creating unique machine:', error);
    return NextResponse.json({ message: 'Failed to create unique machine.', error: error.message }, { status: 500 });
  }
}

// GET method to fetch all unique machines
export async function GET() {
  await dbConnect();
  try {
    const uniqueMachines = await UniqueMachine.find({})
      .populate('machineType', 'name') // Populate the name from the base Machine model
      .sort({ uniqueId: 1 });
    return NextResponse.json(uniqueMachines, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching unique machines:', error);
    return NextResponse.json({ message: 'Failed to fetch unique machines.', error: error.message }, { status: 500 });
  }
}