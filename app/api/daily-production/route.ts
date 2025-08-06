// src/app/api/daily-production/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Production from '@/models/Production';
import mongoose from 'mongoose';

// GET /api/daily-production?date=YYYY-MM-DD&sewingLineId=...
export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const sewingLineId = searchParams.get('sewingLineId');

    if (!dateParam || !sewingLineId) {
      return NextResponse.json({ message: 'Date and sewingLineId are required.' }, { status: 400 });
    }

    const startOfDay = new Date(new Date(dateParam).setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const objectSewingLineId = new mongoose.Types.ObjectId(sewingLineId);

    const productionRecords = await Production.find({
      sewingLine: objectSewingLineId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    })
    .populate('operator', 'name operatorId')
    .populate('machine', 'name')
    .populate('process', 'name')
    .sort({ 'operator.name': 1 }); // Sort by operator name for a clean report

    if (!productionRecords || productionRecords.length === 0) {
      return NextResponse.json({ message: 'No production data found for this date and line.' }, { status: 404 });
    }

    return NextResponse.json(productionRecords, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching daily production:', error);
    return NextResponse.json({ message: 'Failed to fetch daily production data.', error: error.message }, { status: 500 });
  }
}