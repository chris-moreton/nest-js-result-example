import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FunctionalValidationPipe } from './common/pipes/functional-validation.pipe';
import { FunctionalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global pipes
  app.useGlobalPipes(new FunctionalValidationPipe());

  // Global filters
  app.useGlobalFilters(new FunctionalExceptionFilter());

  // Enable CORS
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
