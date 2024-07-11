import { Injectable } from '@nestjs/common';
import { ClientConfig, messagingApi, Message } from '@line/bot-sdk';
import * as crypto from 'crypto';
import { lineConfig } from 'src/configs/lineConfig';
import { Model } from 'mongoose';
import { WebhookHistory } from './schemas/webhook-history.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class WebhooksService {
  private clientConfig: ClientConfig;
  private client: any;

  constructor(
    @InjectModel('WebhookHistory')
    private webhookHistoryModel: Model<WebhookHistory>,
  ) {
    this.clientConfig = {
      channelAccessToken: lineConfig.channelAccessToken,
      channelSecret: lineConfig.channelSecret,
    };
    this.client = new messagingApi.MessagingApiClient(this.clientConfig);
  }

  async webhook(body: any, lineSignature: string) {
    const validateWebhook = await this.validateWebhook(body, lineSignature);
    if (validateWebhook) {
      console.log(`Invalid signature`);
      return;
    }
    await this.saveWebhookHistory(body.destination, body.events);
    return 'OK';
  }

  async replyMessage(replyToken: string, messages: Message | Message[]) {
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
    return this.webhookHistoryModel.find().sort({ createdAt: -1 });
  }

  async validateWebhook(body: any, lineSignature: string) {
    const signature = crypto
      .createHmac('SHA256', lineConfig.channelSecret)
      .update(JSON.stringify(body))
      .digest('base64');
    return signature === lineSignature;
  }
}
