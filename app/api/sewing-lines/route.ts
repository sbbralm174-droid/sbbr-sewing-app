// src/app/api/sewing-lines/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import SewingLine from '@/models/SewingLine';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { name, floor }: { name: string; floor?: string } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'Sewing line name is required.' }, { status: 400 });
    }

    const newSewingLine = await SewingLine.create({
      name,
      floor,
    });

    return NextResponse.json({
      message: 'Sewing line added successfully!',
      data: newSewingLine
    }, { status: 201 });

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A sewing line with this name already exists.' }, { status: 409 });
    }
    console.error('Error adding sewing line:', error);
    return NextResponse.json({ message: 'Failed to add sewing line.', error: error.message }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();

  try {
    const sewingLines = await SewingLine.find({});
    return NextResponse.json(sewingLines, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching sewing lines:', error);
    return NextResponse.json({ message: 'Failed to fetch sewing lines.', error: error.message }, { status: 500 });
  }
}