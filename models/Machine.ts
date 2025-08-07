import mongoose, { Schema, Document } from 'mongoose';

export interface IMachine extends Document {
  machineName: string;
  description?: string;
  machineType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MachineSchema: Schema = new mongoose.Schema({
  machineName: {
    type: String,
    required: [true, 'Machine name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Machine = mongoose.models.Machine || mongoose.model<IMachine>('Machine', MachineSchema);

export default Machine;