import mongoose, { Document, Schema, Model } from 'mongoose';

// Import necessary interfaces for references if you want to populate later
// import { IOperator } from './Operator';
// import { ISewingLine } from './SewingLine';
// import { IMachine } from './Machine'; // Assuming this is for machineType
// import { IProcess } from './Process'; // Assuming this is for process

// Interface for DailyPlan document
export interface IDailyPlan extends Document {
  date: Date;
  operatorId: mongoose.Types.ObjectId; // Reference to Operator
  floor: string;
  lineId: mongoose.Types.ObjectId; // Reference to SewingLine
  machineBrandId: mongoose.Types.ObjectId; // Reference to Machine (or a specific MachineType model)
  uniqueMachineId: string; // This is a string from UniqueMachine
  processId: mongoose.Types.ObjectId; // Reference to Process
  workAs: 'Helper' | 'Operator';
  target: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema for DailyPlan
const DailyPlanSchema: Schema = new Schema(
  {
    date: { type: Date, required: true },
    operatorId: { type: Schema.Types.ObjectId, ref: 'Operator', required: true },
    floor: { type: String, required: true },
    lineId: { type: Schema.Types.ObjectId, ref: 'SewingLine', required: true },
    machineBrandId: { type: Schema.Types.ObjectId, ref: 'Machine', required: true }, // Assuming 'Machine' is the model for machineType
    uniqueMachineId: { type: String, required: true },
    processId: { type: Schema.Types.ObjectId, ref: 'Process', required: true },
    workAs: { type: String, enum: ['Helper', 'Operator'], required: true },
    target: { type: Number, required: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Mongoose Model
const DailyPlan: Model<IDailyPlan> = mongoose.models.DailyPlan || mongoose.model<IDailyPlan>('DailyPlan', DailyPlanSchema);

export default DailyPlan;
