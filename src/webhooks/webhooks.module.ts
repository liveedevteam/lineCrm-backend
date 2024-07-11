import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhookHistorySchema } from './schemas/webhook-history.schema';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { UserLineDataSchema } from './schemas/user-line-data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'WebhookHistory', schema: WebhookHistorySchema },
      { name: 'UserLineData', schema: UserLineDataSchema },
    ]),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
