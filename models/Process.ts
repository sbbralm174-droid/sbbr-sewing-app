// src/models/Process.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for Process document
export interface IProcess extends Document {
  name: string;
  description?: string;
  category?: string; // e.g., "Sewing", "Assembly", "Finishing"
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema for Process
const ProcessSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    category: { type: String },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Mongoose Model
// Check if the model already exists to prevent OverwriteModelError
const Process: Model<IProcess> = mongoose.models.Process || mongoose.model<IProcess>('Process', ProcessSchema);

export default Process;