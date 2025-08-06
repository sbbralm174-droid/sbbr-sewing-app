import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Operator from '@/models/Operator';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id

  await dbConnect();

  const operator = await Operator.findById(id)
    .populate('skills.machines', 'name')
    .populate('skills.processes', 'name');

  if (!operator) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(operator);
}
