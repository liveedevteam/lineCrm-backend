import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): Promise<{
    message: string;
    data: Promise<any>;
    token: string;
  }> {
    return this.appService.getHello();
  }
}
