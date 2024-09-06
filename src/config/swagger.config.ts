import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Cert API')
  .setDescription(
    `The Cert API is designed to handle document authentication and management. It supports two types of users: organizations and normal users. 
    Organizations can review, authorize, and manage documents, while normal users can upload, verify, and track the status of their documents. 
    The API ensures secure document handling and authentication through a robust role-based authorization system. Built with NestJS and TypeORM, 
    the API integrates PostgreSQL for secure and reliable data management, ensuring data consistency and integrity.`,
  )
  .setVersion('1.0')
  .addBearerAuth()
  .addTag(
    'Documents',
    'Endpoints related to document upload, management, and verification',
  )
  .addTag(
    'Auth',
    'Endpoints related to user and organization authentication and authorization',
  )
  .addTag('Users', 'Endpoints for normal user account management')
  .addTag(
    'Organizations',
    'Endpoints for organization account management and document authorization',
  )
  .setContact(
    'Cert API Support',
    'https://cert-api.com',
    'support@cert-api.com',
  )
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addServer(
    process.env.DEV_URL || 'http://localhost:3000',
    'Development Server',
  )
  .addServer(
    process.env.PROD_URL || 'https://api.cert-api.com',
    'Production Server',
  )
  .build();

export const swaggerCustomOptions: SwaggerCustomOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
  },
  customSiteTitle: 'Cert API Documentation',
};

export const globalApiResponses = {
  '401': { description: 'Unauthorized' },
  '403': { description: 'Forbidden' },
  '404': { description: 'Not Found' },
  '500': { description: 'Internal Server Error' },
};
