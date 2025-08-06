// src/models/Production.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProduction extends Document {
  dailyAssignment: mongoose.Types.ObjectId; // Links to the daily plan for context
  operator: mongoose.Types.ObjectId;
  sewingLine: mongoose.Types.ObjectId;
  machine: mongoose.Types.ObjectId;
  process: mongoose.Types.ObjectId;
  hourlyProduction: {
    hour: number; // Represents the hour (e.g., 8, 9, 10, ... 17)
    count: number;
    timestamp: Date;
  }[];
  totalProduction: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductionSchema: Schema = new Schema(
  {
    dailyAssignment: {
      type: Schema.Types.ObjectId,
      ref: 'DailyAssignment',
      required: true,
    },
    operator: {
      type: Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },
    sewingLine: {
      type: Schema.Types.ObjectId,
      ref: 'SewingLine',
      required: true,
    },
    machine: {
      type: Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
    },
    process: {
      type: Schema.Types.ObjectId,
      ref: 'Process',
      required: true,
    },
    hourlyProduction: [
      {
        hour: { type: Number, required: true },
        count: { type: Number, required: true, default: 0 },
        timestamp: { type: Date, required: true },
      },
    ],
    totalProduction: { type: Number, required: true, default: 0 },
    date: {
      type: Date,
      required: true,
      index: true,
      get: (date: Date) => date.toISOString().split('T')[0], // To keep the date clean
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true }, // Apply getter on virtuals and fields
  }
);

// We'll add a unique index to prevent duplicate production entries for the same operator, assignment, and date.
ProductionSchema.index({ dailyAssignment: 1, operator: 1, date: 1 }, { unique: true });

const Production: Model<IProduction> = mongoose.models.Production || mongoose.model<IProduction>('Production', ProductionSchema);

export default Production;