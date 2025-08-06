// src/models/UniqueMachine.ts
import mongoose, { Document, Schema, Model } from 'mongoose';
import { IMachine } from './Machine'; // Import the base Machine interface

export interface IUniqueMachine extends Document {
  machineType: mongoose.Types.ObjectId | IMachine; // References the base Machine model (e.g., "Juki DDL-9000")
  uniqueId: string; // The specific, unique ID for this physical machine (e.g., "M-001")
  floor: string; // The floor where this machine is located
  line: string; // The line where this machine is located
  isUsed: boolean; // Indicates if this machine is currently in use
  createdAt: Date;
  updatedAt: Date;
}

const UniqueMachineSchema: Schema = new Schema(
  {
    machineType: {
      type: Schema.Types.ObjectId,
      ref: 'Machine',
      required: true,
    },
    uniqueId: {
      type: String,
      required: true,
      unique: true,
    },
    floor: {
      type: String,
      required: true,
    },
    line: {
      type: String,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const UniqueMachine: Model<IUniqueMachine> = mongoose.models.UniqueMachine || mongoose.model<IUniqueMachine>('UniqueMachine', UniqueMachineSchema);

export default UniqueMachine;