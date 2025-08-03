// src/app/api/operators/search/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Operator from '@/models/Operator';
import DailyAssignment from '@/models/DailyAssignment'; // Import DailyAssignment model
import mongoose, { Document, Schema, Types } from 'mongoose'; // Ensure mongoose is imported for Types.ObjectId and Document

// Define an interface for the Operator document
interface IProcessSkill {
  process: Types.ObjectId;
  name?: string; // Assuming 'name' might be populated
}

interface IMachineSkill {
  machine: Types.ObjectId;
  name?: string; // Assuming 'name' might be populated
}

interface IOperator extends Document {
  _id: Types.ObjectId; // Explicitly define _id
  operatorId: string;
  name: string;
  contactNumber?: string;
  skills: {
    processes: IProcessSkill[];
    machines: IMachineSkill[];
  };
  isActive: boolean;
}

// Define an interface for a single assignment within DailyAssignment
interface IAssignment {
  operator: Types.ObjectId; // Reference to Operator _id
  status: string; // e.g., 'Present', 'Absent', 'Leave'
  // Add other fields if they exist in your assignment subdocument
}

// Define an interface for DailyAssignment document
interface IDailyAssignment extends Document {
  date: Date;
  sewingLine: Types.ObjectId; // Reference to SewingLine _id
  assignments: IAssignment[];
}


export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const processIds = searchParams.getAll('processIds');
    const dateParam = searchParams.get('date'); // Get the optional date parameter
    const sewingLineIdParam = searchParams.get('sewingLineId'); // Get the optional sewing line ID

    if (processIds.length === 0) {
      return NextResponse.json({ message: 'At least one process ID is required for search.' }, { status: 400 });
    }

    const objectProcessIds = processIds.map(id => new mongoose.Types.ObjectId(id));

    // Base query for operators skilled in the processes
    let operatorQuery: any = {
      'skills.processes': { $all: objectProcessIds },
      isActive: true, // Only search for active operators by default
    };

    // Find operators based on skills
    const skilledOperators: IOperator[] = await Operator.find(operatorQuery)
      .populate('skills.machines', 'name')
      .populate('skills.processes', 'name')
      .select('operatorId name contactNumber skills isActive');

    // If date and sewingLineId are provided, determine attendance
    let operatorsWithAttendance: any[] = skilledOperators.map(op => ({
      ...op.toObject(), // Convert Mongoose document to plain JS object
      attendanceStatus: 'N/A', // Default status if no date/line or no assignment found
    }));

    if (dateParam && sewingLineIdParam) {
      const normalizedDate = new Date(new Date(dateParam).setUTCHours(0, 0, 0, 0));

      // Find the daily assignment for the specified date and line
      const dailyAssignment: IDailyAssignment | null = await DailyAssignment.findOne({
        date: normalizedDate,
        sewingLine: sewingLineIdParam,
      });

      if (dailyAssignment) {
        // Map attendance status to each skilled operator
        operatorsWithAttendance = skilledOperators.map((op: IOperator) => { // Explicitly type 'op' here
          const assignment = dailyAssignment.assignments.find(
            (assign: IAssignment) => assign.operator.toString() === op._id.toString() // Explicitly type 'assign' here
          );
          return {
            ...op.toObject(),
            attendanceStatus: assignment ? assignment.status : 'N/A', // Use found status or N/A
          };
        });
      }
      // If dailyAssignment is not found, all operators will remain 'N/A' for attendance, which is correct.
    }

    return NextResponse.json(operatorsWithAttendance, { status: 200 });
  } catch (error: any) {
    console.error('Error searching operators:', error);
    if (error.name === 'CastError' && error.path === '_id') {
      return NextResponse.json({ message: 'Invalid ID format provided for processes or sewing line.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to search operators.', error: error.message }, { status: 500 });
  }
}
