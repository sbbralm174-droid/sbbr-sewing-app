// src/models/Operator.ts
import mongoose, { Document, Schema, Model } from 'mongoose';
import { IMachine } from './Machine'; // Import Machine interface
import { IProcess } from './Process'; // Import Process interface

// Interface for Operator document
export interface IOperator extends Document {
  operatorId: string; // Unique ID for the operator, e.g., "OP001"
  operatorDesigation: string; // Operator Desigation
  name: string;
  contactNumber?: string;
  skills: {
    machines: mongoose.Types.ObjectId[] | IMachine[]; // References to Machine documents
    processes: mongoose.Types.ObjectId[] | IProcess[]; // References to Process documents
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema for Operator
const OperatorSchema: Schema = new Schema(
  {
    operatorId: { type: String, required: true, unique: true },
    operatorDesigation: { type: String, required: true },
    name: { type: String, required: true },
    contactNumber: { type: String },
    skills: {
      machines: [{ type: Schema.Types.ObjectId, ref: 'Machine' }], // Array of Machine ObjectIDs
      processes: [{ type: Schema.Types.ObjectId, ref: 'Process' }], // Array of Process ObjectIDs
    },
    isActive: { type: Boolean, default: true }, // Whether the operator is currently active
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Mongoose Model
const Operator: Model<IOperator> = mongoose.models.Operator || mongoose.model<IOperator>('Operator', OperatorSchema);

export default Operator;