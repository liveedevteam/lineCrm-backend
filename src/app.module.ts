import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Load .env file
    MongooseModule.forRoot(process.env.MONGO_URI), WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
