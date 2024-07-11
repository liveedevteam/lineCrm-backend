import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';

@Injectable()
export class AppService {
  async getHello(): Promise<{
    message: string;
    data: Promise<any>;
    token: string;
  }> {
    const { data } = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
    const token = jwt.sign({ sub: 'nhoiq133' }, 'secret', { expiresIn: '1h' });
    return {
      message: 'Hello World!',
      data,
      token,
    };
  }
}
