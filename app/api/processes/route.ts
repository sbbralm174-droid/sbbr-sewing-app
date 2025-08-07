// src/app/api/processes/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Process from '@/models/Process';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { names }: { names: string } = await req.json();

    if (!names) {
      return NextResponse.json({ message: 'Process names are required.' }, { status: 400 });
    }

    const processNames = names.split(',').map(name => name.trim()).filter(name => name.length > 0);

    if (processNames.length === 0) {
      return NextResponse.json({ message: 'No valid process names provided.' }, { status: 400 });
    }

    const newProcesses = processNames.map(name => ({ processName:name }));

    const insertedProcesses = await Process.insertMany(newProcesses, { ordered: false });

    return NextResponse.json({
      message: 'Processes added successfully!',
      count: insertedProcesses.length,
      data: insertedProcesses
    }, { status: 201 });

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'One or more process names already exist.' }, { status: 409 });
    }
    console.error('Error adding processes:', error);
    return NextResponse.json({ message: 'Failed to add processes.', error: error.message }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();

  try {
    const processes = await Process.find({});
    return NextResponse.json(processes, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching processes:', error);
    return NextResponse.json({ message: 'Failed to fetch processes.', error: error.message }, { status: 500 });
  }
}