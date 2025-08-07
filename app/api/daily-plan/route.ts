import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb'; // Adjust path if necessary
import DailyPlan from '@/models/DailyPlan'; // Import your new DailyPlan model

export async function POST(req: Request) {
  await dbConnect();

  try {
    const {
      date,
      operatorId,
      floor,
      lineId,
      machineBrandId,
      uniqueMachineId,
      processId,
      workAs,
      target,
    } = await req.json();

    // Basic validation (can be expanded)
    if (!date || !operatorId || !floor || !lineId || !machineBrandId || !uniqueMachineId || !processId || !workAs || target === undefined || target === null) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    const newDailyPlan = await DailyPlan.create({
      date,
      operatorId,
      floor,
      lineId,
      machineBrandId,
      uniqueMachineId,
      processId,
      workAs,
      target,
    });

    return NextResponse.json({
      message: 'Daily plan saved successfully!',
      data: newDailyPlan
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error saving daily plan:', error);
    return NextResponse.json({ message: 'Failed to save daily plan.', error: error.message }, { status: 500 });
  }
}

// You can also add a GET function here to fetch daily plans later
/*
export async function GET(req: Request) {
  await dbConnect();
  try {
    const dailyPlans = await DailyPlan.find({})
      .populate('operatorId', 'name operatorId operatorDesigation') // Populate operator details
      .populate('lineId', 'name floor') // Populate line details
      .populate('machineBrandId', 'name') // Populate machine brand details
      .populate('processId', 'name') // Populate process details
      .sort({ date: -1, createdAt: -1 }); // Sort by date descending

    return NextResponse.json(dailyPlans, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching daily plans:', error);
    return NextResponse.json({ message: 'Failed to fetch daily plans.', error: error.message }, { status: 500 });
  }
}
*/
