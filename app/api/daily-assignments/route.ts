// src/app/api/daily-assignments/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyAssignment from '@/models/DailyAssignment';
import Operator from '@/models/Operator'; // Needed for pre-populating operators
import SewingLine from '@/models/SewingLine'; // Needed for pre-populating sewing lines

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { date, sewingLineId, assignments } = await req.json();

    if (!date || !sewingLineId || !assignments || !Array.isArray(assignments)) {
      return NextResponse.json({ message: 'Date, sewing line ID, and assignments array are required.' }, { status: 400 });
    }

    // Ensure date is processed to be consistent (e.g., start of day UTC)
    const normalizedDate = new Date(new Date(date).setUTCHours(0, 0, 0, 0));

    // Try to find an existing assignment for the given date and sewing line
    let dailyAssignment = await DailyAssignment.findOne({
      date: normalizedDate,
      sewingLine: sewingLineId,
    });

    if (dailyAssignment) {
      // If found, update it (e.g., replace existing assignments)
      dailyAssignment.assignments = assignments.map((assign: any) => ({
        operator: assign.operatorId,
        status: assign.status,
        machine: assign.machineId || null, // Ensure null if not provided
        process: assign.processId || null, // Ensure null if not provided
        targetProduction: assign.targetProduction || 0,
      }));
      await dailyAssignment.save();
      return NextResponse.json({ message: 'Daily assignment updated successfully!', data: dailyAssignment }, { status: 200 });
    } else {
      // If not found, create a new one
      const newDailyAssignment = await DailyAssignment.create({
        date: normalizedDate,
        sewingLine: sewingLineId,
        assignments: assignments.map((assign: any) => ({
          operator: assign.operatorId,
          status: assign.status,
          machine: assign.machineId || null,
          process: assign.processId || null,
          targetProduction: assign.targetProduction || 0,
        })),
      });
      return NextResponse.json({ message: 'Daily assignment created successfully!', data: newDailyAssignment }, { status: 201 });
    }

  } catch (error: any) {
    console.error('Error saving daily assignment:', error);
    // Handle duplicate key error specifically for the unique index
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A daily assignment for this line on this date already exists. Please update it instead.', error: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to save daily assignment.', error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const sewingLineIdParam = searchParams.get('sewingLineId');

    if (!dateParam || !sewingLineIdParam) {
      return NextResponse.json({ message: 'Date and sewingLineId are required query parameters.' }, { status: 400 });
    }

    const normalizedDate = new Date(new Date(dateParam).setUTCHours(0, 0, 0, 0));

    const dailyAssignment = await DailyAssignment.findOne({
      date: normalizedDate,
      sewingLine: sewingLineIdParam,
    })
      .populate({
        path: 'assignments.operator',
        model: 'Operator',
        select: 'operatorId name', // Only retrieve operatorId and name for operator
      })
      .populate({
        path: 'assignments.machine',
        model: 'Machine',
        select: 'name', // Only retrieve name for machine
      })
      .populate({
        path: 'assignments.process',
        model: 'Process',
        select: 'name', // Only retrieve name for process
      })
      .populate({
        path: 'sewingLine',
        model: 'SewingLine',
        select: 'name', // Only retrieve name for sewing line
      });

    if (!dailyAssignment) {
      return NextResponse.json({ message: 'No assignment found for this date and line.' }, { status: 404 });
    }

    return NextResponse.json(dailyAssignment, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching daily assignment:', error);
    return NextResponse.json({ message: 'Failed to fetch daily assignment.', error: error.message }, { status: 500 });
  }
}