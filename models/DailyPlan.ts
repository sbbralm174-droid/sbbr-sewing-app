// src/models/DailyPlan.ts
import mongoose, { Document, Schema, Model } from 'mongoose';
import { IOperator } from './Operator';
import { IUniqueMachine } from './UniqueMachine';

// Enum for operator status
export enum OperatorStatus {
  NOT_ENTERED = 'not entered',
  PRESENT = 'present',
  ABSENT = 'absent',
  LEAVE = 'leave',
}

export interface IDailyPlan extends Document {
  date: Date;
  sewingFloor: string;
  sewingLine: string;
  operator: mongoose.Types.ObjectId | IOperator;
  status: OperatorStatus;
  target: number;
  assignedMachine?: mongoose.Types.ObjectId | IUniqueMachine; // Assigning a unique machine
  assignedProcess: string; // The process the operator will perform
  createdAt: Date;
  updatedAt: Date;
}

const DailyPlanSchema: Schema = new Schema(
  {
    date: { type: Date, required: true },
    sewingFloor: { type: String, required: true },
    sewingLine: { type: String, required: true },
    operator: {
      type: Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OperatorStatus),
      default: OperatorStatus.NOT_ENTERED,
    },
    target: { type: Number, required: true, default: 0 },
    assignedMachine: {
      type: Schema.Types.ObjectId,
      ref: 'UniqueMachine',
      required: false,
    },
    assignedProcess: { type: String, required: true }, // Assumes process name is a string
  },
  {
    timestamps: true,
    // Add a unique compound index to ensure one plan per operator per day
    indexes: [{ unique: true, fields: ['date', 'operator'] }],
  }
);

const DailyPlan: Model<IDailyPlan> =
  mongoose.models.DailyPlan || mongoose.model<IDailyPlan>('DailyPlan', DailyPlanSchema);

export default DailyPlan;