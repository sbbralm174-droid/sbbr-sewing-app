// /app/api/operators/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Operator from '@/models/Operator';

export async function GET(req: Request) {
  await dbConnect();

  try {
    const url = new URL(req.url);
    const searchTerm = url.searchParams.get('search');

    let query: any = {};
    if (searchTerm) {
      query = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { operatorId: { $regex: searchTerm, $options: 'i' } },
        ],
      };
    }

    const operators = await Operator.find(query)
      .populate('skills.machines', 'machineName')
      .populate('skills.processes', 'processName')
      .sort({ name: 1 });

    console.log('Populated Operators:\n', JSON.stringify(operators, null, 2));

    return NextResponse.json(operators, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching operators:', error);
    return NextResponse.json(
      { message: 'Failed to fetch operators.', error: error.message },
      { status: 500 }
    );
  }
}
