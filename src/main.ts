import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { DbExceptionFilter } from './filters/db-exception-filter.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.useGlobalFilters(new DbExceptionFilter())
  app.useGlobalPipes(
    new ValidationPipe(
      {
        whitelist:true,
        forbidNonWhitelisted:true,
        forbidUnknownValues:true
      }
    )
  )
  useContainer(app.select(AppModule),{fallbackOnErrors:true})

  const config = new DocumentBuilder().setTitle('E-commerce').setDescription('E-commerce-api').setVersion('1.0').addBearerAuth().build()
  const documenFactory = () => SwaggerModule.createDocument(app,config,{autoTagControllers:true});
  SwaggerModule.setup('api',app,documenFactory)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
