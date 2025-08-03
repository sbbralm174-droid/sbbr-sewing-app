// src/models/SewingLine.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for SewingLine document
export interface ISewingLine extends Document {
  name: string; // e.g., "Line 1", "Finishing Line A"
  location?: string; // e.g., "Floor A", "Building 2"
  supervisorId?: mongoose.Types.ObjectId; // Optional: Reference to a User/Supervisor
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema for SewingLine
const SewingLineSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    location: { type: String },
    // If you plan to have a 'User' model for supervisors later, you can uncomment this:
    // supervisorId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Mongoose Model
const SewingLine: Model<ISewingLine> = mongoose.models.SewingLine || mongoose.model<ISewingLine>('SewingLine', SewingLineSchema);

export default SewingLine;