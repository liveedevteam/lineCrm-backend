import { Schema, Document } from 'mongoose';

export interface UserLineData extends Document {
  userId: string;
  displayName: string;
  pictureUrl: string;
  statusMessage: string;
}

export const UserLineDataSchema = new Schema({
  userId: { type: String, required: true },
  displayName: { type: String, required: true },
  pictureUrl: { type: String, required: true },
  statusMessage: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
