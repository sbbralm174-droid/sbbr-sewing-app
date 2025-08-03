// src/models/DailyAssignment.ts
import mongoose, { Document, Schema, Model } from 'mongoose';
import { IOperator } from './Operator'; // Import Operator interface
import { ISewingLine } from './SewingLine'; // Import SewingLine interface
import { IMachine } from './Machine'; // Import Machine interface
import { IProcess } from './Process'; // Import Process interface

// Interface for a single operator's assignment within a day
export interface IOperatorDailyAssignment {
  operator: mongoose.Types.ObjectId | IOperator; // Reference to Operator
  
  status: 'Present' | 'Absent' | 'Leave'; // Operator's attendance status
  machine?: mongoose.Types.ObjectId | IMachine; // Optional: Reference to Machine if present
  process?: mongoose.Types.ObjectId | IProcess; // Optional: Reference to Process if present
  targetProduction?: number; // Daily target for this operator
}

// Interface for the main DailyAssignment document
export interface IDailyAssignment extends Document {
  date: Date; // Date of the assignment (start of day, UTC)
  sewingLine: mongoose.Types.ObjectId | ISewingLine; // Reference to SewingLine
  supervisor?: mongoose.Types.ObjectId; // Optional: Reference to a User (Supervisor)
  assignments: IOperatorDailyAssignment[]; // Array of individual operator assignments
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema for IOperatorDailyAssignment (Sub-document)
const OperatorDailyAssignmentSchema: Schema = new Schema(
  {
    operator: { type: Schema.Types.ObjectId, ref: 'Operator', required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Leave'], required: true },
    machine: { type: Schema.Types.ObjectId, ref: 'Machine' },
    process: { type: Schema.Types.ObjectId, ref: 'Process' },
    targetProduction: { type: Number, min: 0 },
  },
  { _id: false } // Do not create an _id for sub-documents, if not needed
);

// Mongoose Schema for DailyAssignment
const DailyAssignmentSchema: Schema = new Schema(
  {
    date: { type: Date, required: true },
    sewingLine: { type: Schema.Types.ObjectId, ref: 'SewingLine', required: true },
    // supervisor: { type: Schema.Types.ObjectId, ref: 'User' }, // Uncomment if you have a User model
    assignments: [OperatorDailyAssignmentSchema], // Array of sub-documents
  },
  {
    timestamps: true,
  }
);

// Add a unique compound index to prevent duplicate entries for the same line on the same day
DailyAssignmentSchema.index({ date: 1, sewingLine: 1 }, { unique: true });

const DailyAssignment: Model<IDailyAssignment> =
  mongoose.models.DailyAssignment || mongoose.model<IDailyAssignment>('DailyAssignment', DailyAssignmentSchema);

export default DailyAssignment;