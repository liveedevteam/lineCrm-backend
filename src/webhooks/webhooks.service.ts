import { Injectable } from '@nestjs/common';
import {
  ClientConfig,
  messagingApi,
  Message,
  WebhookRequestBody,
} from '@line/bot-sdk';
import * as crypto from 'crypto';
import { lineConfig } from 'src/configs/lineConfig';
import { Model } from 'mongoose';
import { WebhookHistory } from './schemas/webhook-history.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UserLineData } from './schemas/user-line-data.schema';

@Injectable()
export class WebhooksService {
  private clientConfig: ClientConfig;
  private client;

  constructor(
    @InjectModel('WebhookHistory')
    private webhookHistoryModel: Model<WebhookHistory>,
    @InjectModel('UserLineData')
    private userLineDataModel: Model<UserLineData>,
  ) {
    this.clientConfig = {
      channelAccessToken: lineConfig.channelAccessToken,
      channelSecret: lineConfig.channelSecret,
    };
    this.client = new messagingApi.MessagingApiClient(this.clientConfig);
  }

  async webhook(body: WebhookRequestBody, lineSignature: string) {
    const validateWebhook = await this.validateWebhook(body, lineSignature);
    if (validateWebhook) {
      console.log(`Invalid signature`);
      return;
    }
    await this.saveWebhookHistory(body.destination, body.events);
    await Promise.all(
      body.events.map(async (event) => {
        await this.saveAndUpdateUserLineData(event.source.userId);
      }),
    );
    return 'OK';
  }

  async saveWebhookHistory(
    destination: WebhookRequestBody['destination'],
    events: WebhookRequestBody['events'],
  ) {
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

  async validateWebhook(body: WebhookRequestBody, lineSignature: string) {
    const signature = crypto
      .createHmac('SHA256', lineConfig.channelSecret)
      .update(JSON.stringify(body))
      .digest('base64');
    return signature === lineSignature;
  }

  async saveAndUpdateUserLineData(userId: string) {
    const userLineData = await this.userLineDataModel.findOne({ userId });
    if (!userLineData) {
      const profile = await this.client.getProfile(userId);
      const newUserLineData = new this.userLineDataModel({
        userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
      });
      return newUserLineData.save();
    }
    const profile = await this.client.getProfile(userId);
    if (
      userLineData.displayName !== profile.displayName ||
      userLineData.pictureUrl !== profile.pictureUrl ||
      userLineData.statusMessage !== profile.statusMessage
    ) {
      userLineData.displayName = profile.displayName;
      userLineData.pictureUrl = profile.pictureUrl;
      userLineData.statusMessage = profile.statusMessage;
      return userLineData.save();
    }
  }
}
