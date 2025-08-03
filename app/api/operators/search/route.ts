// src/app/api/operators/search/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Operator from '@/models/Operator';
import mongoose from 'mongoose'; // Add this import at the top

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    // Get all 'processIds' from query parameters (can be multiple)
    const processIds = searchParams.getAll('processIds');

    if (processIds.length === 0) {
      return NextResponse.json({ message: 'At least one process ID is required for search.' }, { status: 400 });
    }

    // Convert string IDs to Mongoose ObjectIds
    //const objectProcessIds = processIds.map(id => new dbConnect.Types.ObjectId(id));
    const objectProcessIds = processIds.map(id => new mongoose.Types.ObjectId(id)); // Corrected line // Using dbConnect.Types.ObjectId if Mongoose.Types is not exposed directly

    // Find operators who are skilled in ALL of the selected processes ($all operator)
    const operators = await Operator.find({
      'skills.processes': { $all: objectProcessIds },
      isActive: true // Optionally, only search for active operators
    })
      .populate('skills.machines', 'name') // Populate machine names
      .populate('skills.processes', 'name') // Populate process names
      .select('operatorId name contactNumber skills isActive'); // Select only necessary fields

    return NextResponse.json(operators, { status: 200 });
  } catch (error: any) {
    console.error('Error searching operators:', error);
    // Handle potential invalid ObjectId format error
    if (error.name === 'CastError' && error.path === '_id') {
      return NextResponse.json({ message: 'Invalid process ID format provided.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to search operators.', error: error.message }, { status: 500 });
  }
}