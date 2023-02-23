import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  //Initial the nestjs app and allow cors or whitelist urls
  const app = await NestFactory.create(AppModule,{cors:{'origin':"http://localhost:6000", 'credentials':true,'allowedHeaders':['POST','PUTCH','GET','DELETE']}});

  //Swagger documentation
  const swaggerConfig = new DocumentBuilder()
  .setTitle('Nestjs Ecommerce Test')
  .setDescription('Api description document')
  .setVersion('1')
  .addTag('Ecommerce')
  .setVersion('1')
  .build()

  const options: SwaggerDocumentOptions =  {
    operationIdFactory: (
      controllerKey: string,
      methodKey: string
    ) => methodKey
  };
  const swagger_document = SwaggerModule.createDocument(app, swaggerConfig,options)



  //Secure the api routes with helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  }))


  //set api version
  app.enableVersioning({
    defaultVersion:'1',
    type:VersioningType.URI,
    
  })

  SwaggerModule.setup('api', app, swagger_document)

  //Add global pipes to the project
  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist:true //prevent sql injections
    }
  ))



  await app.listen(4000);
}
bootstrap();
