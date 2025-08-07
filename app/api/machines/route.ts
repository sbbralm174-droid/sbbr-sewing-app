import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Machine from '@/models/Machine';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { names }: { names: string } = await req.json();

    if (!names) {
      return NextResponse.json({ message: 'Machine names are required.' }, { status: 400 });
    }

    const machineNames = names.split(',').map(name => name.trim()).filter(name => name.length > 0);

    if (machineNames.length === 0) {
      return NextResponse.json({ message: 'No valid machine names provided.' }, { status: 400 });
    }

    // এখানে machineName ব্যবহার করা হয়েছে
    const newMachines = machineNames.map(name => ({ machineName: name }));

    const insertedMachines = await Machine.insertMany(newMachines, { ordered: false });

    return NextResponse.json({
      message: 'Machines added successfully!',
      count: insertedMachines.length,
      data: insertedMachines
    }, { status: 201 });

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'One or more machine names already exist.' }, { status: 409 });
    }
    console.error('Error adding machines:', error);
    return NextResponse.json({ message: 'Failed to add machines.', error: error.message }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();

  try {
    const machines = await Machine.find({});
    return NextResponse.json(machines, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching machines:', error);
    return NextResponse.json({ message: 'Failed to fetch machines.', error: error.message }, { status: 500 });
  }
}