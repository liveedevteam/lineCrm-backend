// src/webhooks/schemas/webhook-history.schema.ts
import { Schema, Document } from 'mongoose';

export interface WebhookHistory extends Document {
  destination: string;
  events: any;
}

export const WebhookHistorySchema = new Schema({
  destination: { type: String, required: true },
  events: { type: Schema.Types.Mixed, required: true },
});
