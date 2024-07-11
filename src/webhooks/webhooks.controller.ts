import {
  Headers,
  Body,
  Controller,
  Get,
  Post,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('line')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Body() body: any,
    @Headers('x-line-signature') lineSignature: string,
  ) {
    return this.webhooksService.webhook(body, lineSignature);
  }

  @Get('line')
  @HttpCode(HttpStatus.OK)
  async getWebhookHistory() {
    return this.webhooksService.getWebhookHistory();
  }
}
