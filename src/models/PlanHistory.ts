import mongoose, { Schema, Document } from "mongoose";

export interface IPlanHistory extends Document {
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date | null;
  status: 'active' | 'expired' | 'cancelled';
  reason: string;
}

const PlanHistorySchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  reason: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const PlanHistory = mongoose.model<IPlanHistory>("PlanHistory", PlanHistorySchema); 