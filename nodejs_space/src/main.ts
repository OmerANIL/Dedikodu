import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.enableCors({ origin: '*' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger setup
  const swaggerPath = 'api-docs';

  // Prevent caching of Swagger docs
  app.use(`/${swaggerPath}`, (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Dedikodu API')
    .setDescription('Location-based gossip sharing platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document, {
    customSiteTitle: 'Dedikodu API',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { font-size: 2rem; color: #1a1a2e; }
      .swagger-ui .info { margin: 30px 0; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 15px; border-radius: 8px; }
      .swagger-ui .opblock-tag { font-size: 1.1rem; border-bottom: 2px solid #e9ecef; }
      .swagger-ui .opblock { border-radius: 8px; margin-bottom: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
      .swagger-ui .btn { border-radius: 6px; }
      body { background: #fafbfc; }
    `,
  });

  await app.listen(3000);
  logger.log('Dedikodu API running on port 3000');
  logger.log(`Swagger docs at http://localhost:3000/${swaggerPath}`);
}
bootstrap();
