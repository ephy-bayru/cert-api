import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

// Update the API version if it has changed
export const swaggerConfig = new DocumentBuilder()
  .setTitle('Cert API')
  .setDescription(
    `
    The Cert API is a comprehensive document authentication and management system. It supports multiple user types and provides a wide range of functionalities:

    - **Auth**: Secure login and registration processes with role-based access control.
    - **Users**: Regular users can register, login, manage their profile, upload documents, and track document statuses.
    - **Organizations**: Can review, authorize, and manage documents submitted by users.
    - **Admins**: Have overall system management capabilities.
    - **Documents**: Upload, verification, and management of various document types.
    - **Verifications**: Process for verifying and validating submitted documents.
    - **Notifications**: Advanced system for keeping users and organizations informed about important events and status changes.

    Built with NestJS and TypeORM, the API integrates PostgreSQL for secure and reliable data management, ensuring data consistency and integrity. It implements robust security measures including encryption, rate limiting, and comprehensive error handling.

    ## API Versioning
    This API uses URI versioning. All endpoints are prefixed with /api/v{version_number}.
    Current version: v1

    ## Rate Limiting
    To ensure fair usage and protect our services from abuse, rate limiting is implemented on all endpoints. Please refer to the response headers for rate limit information.

    ## Authentication
    Most endpoints require authentication. Use the /auth endpoints to obtain a JWT token, then include it in the Authorization header of your requests.

    ## Pagination
    List endpoints support pagination. Use the 'page' and 'limit' query parameters to control the results.

    ## Error Handling
    The API uses standard HTTP status codes and returns detailed error messages to help with debugging.
  `,
  )
  .setVersion('1.0') // Update version if necessary
  .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
  .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, 'API_KEY')
  // Ensure all tags used in controllers are included here
  .addTag('Auth', 'Authentication and authorization endpoints')
  .addTag('Users', 'User account management endpoints')
  .addTag('Organizations', 'Organization management endpoints')
  .addTag('Admin', 'System administration endpoints')
  .addTag(
    'Documents',
    'Document upload, management, and verification endpoints',
  )
  .addTag('Verifications', 'Document verification process endpoints')
  .addTag(
    'Notifications',
    'Notification management for users and organizations',
  )
  .addTag('Health', 'API health check endpoints')
  .addTag(
    'Audit Logs',
    'Endpoints for managing and retrieving system audit logs',
  )
  // Add any new tags introduced
  // .addTag('NewTag', 'Description of the new tag')
  .setContact(
    'Cert API Support',
    'https://cert-api.com',
    'support@cert-api.com',
  )
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .setExternalDoc('Full API Documentation', 'https://docs.cert-api.com')
  .addServer(
    process.env.DEV_URL || 'http://localhost:3000/api',
    'Development Server',
  )
  .addServer(
    process.env.STAGING_URL || 'https://staging.cert-api.com/api',
    'Staging Server',
  )
  .addServer(
    process.env.PROD_URL || 'https://api.cert-api.com/api',
    'Production Server',
  )
  .build();

export const swaggerCustomOptions: SwaggerCustomOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    displayRequestDuration: true,
    syntaxHighlight: {
      activate: true,
      theme: 'monokai',
    },
  },
  customSiteTitle: 'Cert API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  // customfavIcon: '/assets/favicon.ico',
};

export const globalApiResponses = {
  '200': {
    description: 'Successful operation',
  },
  '201': {
    description: 'Resource created successfully',
  },
  '204': {
    description: 'Successful operation with no content to return',
  },
  '400': {
    description: 'Bad Request - The request was invalid or cannot be served',
  },
  '401': {
    description: 'Unauthorized - The request requires user authentication',
  },
  '403': {
    description:
      'Forbidden - The server understood the request but refuses to authorize it',
  },
  '404': {
    description: 'Not Found - The requested resource could not be found',
  },
  '422': {
    description:
      'Unprocessable Entity - The request was well-formed but was unable to be followed due to semantic errors',
  },
  '429': {
    description:
      'Too Many Requests - The user has sent too many requests in a given amount of time',
  },
  '500': {
    description:
      'Internal Server Error - The server encountered an unexpected condition that prevented it from fulfilling the request',
  },
};

export const applySwaggerGlobalApiResponses = (document: any) => {
  for (const path in document.paths) {
    for (const method in document.paths[path]) {
      document.paths[path][method].responses = {
        ...document.paths[path][method].responses,
        ...globalApiResponses,
      };
    }
  }
  return document;
};
