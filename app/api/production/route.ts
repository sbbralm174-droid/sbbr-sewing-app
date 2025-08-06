// src/app/api/production/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Production, { IProduction } from '@/models/Production';
import DailyAssignment from '@/models/DailyAssignment';

// POST /api/production - Create or update production data
export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { dailyAssignmentId, operatorId, sewingLineId, machineId, processId, hour, count } = body;

    if (!dailyAssignmentId || !operatorId || !sewingLineId || !machineId || !processId || hour === undefined || count === undefined) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    const currentDate = new Date();
    const normalizedDate = new Date(currentDate.setUTCHours(0, 0, 0, 0));

    // Find the DailyAssignment to get the correct date
    const dailyAssignment = await DailyAssignment.findById(dailyAssignmentId);
    if (!dailyAssignment) {
      return NextResponse.json({ message: 'Daily Assignment not found.' }, { status: 404 });
    }
    const assignmentDate = new Date(dailyAssignment.date.setUTCHours(0, 0, 0, 0));

    // Check if the production record for the day already exists
    let productionRecord: IProduction | null = await Production.findOne({
      dailyAssignment: dailyAssignmentId,
      operator: operatorId,
      sewingLine: sewingLineId,
      date: assignmentDate,
    });

    if (productionRecord) {
      // Record exists, update the hourly production
      const hourlyIndex = productionRecord.hourlyProduction.findIndex(h => h.hour === hour);
      if (hourlyIndex > -1) {
        // Hour already exists, update the count
        productionRecord.hourlyProduction[hourlyIndex].count = count;
      } else {
        // Hour doesn't exist, push a new entry
        productionRecord.hourlyProduction.push({ hour, count, timestamp: new Date() });
      }

      // Recalculate total production
      productionRecord.totalProduction = productionRecord.hourlyProduction.reduce(
        (sum, item) => sum + item.count,
        0
      );
      await productionRecord.save();
    } else {
      // No record exists, create a new one
      productionRecord = await Production.create({
        dailyAssignment: dailyAssignmentId,
        operator: operatorId,
        sewingLine: sewingLineId,
        machine: machineId,
        process: processId,
        date: assignmentDate,
        hourlyProduction: [{ hour, count, timestamp: new Date() }],
        totalProduction: count,
      });
    }

    return NextResponse.json(productionRecord, { status: 201 });
  } catch (error: any) {
    console.error('Error saving production data:', error);
    return NextResponse.json({ message: 'Failed to save production data.', error: error.message }, { status: 500 });
  }
}