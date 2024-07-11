import { Injectable } from '@nestjs/common';
import * as line from '@line/bot-sdk';
import * as crypto from 'crypto';
import { lineConfig } from 'src/configs/lineConfig';
import { Model } from 'mongoose';
import { WebhookHistory } from './schemas/webhook-history.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class WebhooksService {
  private client: line.Client;

  constructor(
    @InjectModel('WebhookHistory')
    private webhookHistoryModel: Model<WebhookHistory>,
  ) {
    this.client = new line.Client(lineConfig);
  }

  async webhook(body: any, lineSignature: string) {
    console.log(`webhook body`, JSON.stringify(body));
    const signature = crypto
      .createHmac('SHA256', lineConfig.channelSecret)
      .update(JSON.stringify(body))
      .digest('base64');
    if (signature !== lineSignature) {
      console.log(`Invalid signature`);
      return;
    }
    console.log(`Valid signature`);
    await this.saveWebhookHistory(body.destination, body.events);
    return 'OK';
  }

  async replyMessage(
    replyToken: string,
    messages: line.Message | line.Message[],
  ) {
    return this.client.replyMessage(replyToken, messages);
  }

  async saveWebhookHistory(destination: string, events: any) {
    if (!destination || destination === '') {
      console.log(`Invalid destination`);
      return;
    }
    if (!events || events.length === 0) {
      console.log(`Invalid events`);
      return;
    }
    const webhookHistory = new this.webhookHistoryModel({
      destination,
      events,
    });
    return webhookHistory.save();
  }

  async getWebhookHistory() {
    return this.webhookHistoryModel.find().exec();
  }
}
