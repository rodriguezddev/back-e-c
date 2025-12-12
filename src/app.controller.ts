import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from './auth/decorators/isPublic.decorator';

@ApiBearerAuth()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({summary:'Hola mundo.'})
  getHello(): string {
    return this.appService.getHello();
  }
}
