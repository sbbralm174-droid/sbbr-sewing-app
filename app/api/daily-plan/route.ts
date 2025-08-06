// src/app/api/daily-plan/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyPlan, { OperatorStatus } from '@/models/DailyPlan';
import Operator from '@/models/Operator';

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { date, sewingFloor, sewingLine, operatorId, status, target, assignedProcess, assignedMachine } = body;

    if (!date || !sewingFloor || !sewingLine || !operatorId || !status || target === undefined || !assignedProcess) {
      return NextResponse.json({ message: 'All required fields must be provided.' }, { status: 400 });
    }

    const newPlan = new DailyPlan({
      date: new Date(date),
      sewingFloor,
      sewingLine,
      operator: operatorId,
      status: status as OperatorStatus,
      target,
      assignedProcess,
      assignedMachine,
    });

    await newPlan.save();
    return NextResponse.json(newPlan, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A plan for this operator on this date already exists.' }, { status: 409 });
    }
    console.error('Error creating daily plan:', error);
    return NextResponse.json({ message: 'Failed to create daily plan.', error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  await dbConnect();
  try {
    const url = new URL(req.url);
    const date = url.searchParams.get('date');

    if (!date) {
      return NextResponse.json({ message: 'Date parameter is required.' }, { status: 400 });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const plans = await DailyPlan.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    })
    .populate('operator', 'name operatorId skills') // Populate operator details
    .populate('assignedMachine', 'uniqueId floor line'); // Populate machine details

    return NextResponse.json(plans, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching daily plans:', error);
    return NextResponse.json({ message: 'Failed to fetch daily plans.', error: error.message }, { status: 500 });
  }
}