import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '👾 Welcome to your app deployed on a kubernetes cluster with Qovery through a Dagger pipeline! 👾';
  }
}
