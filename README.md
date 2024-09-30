# cert-api

## Overview

**cert-api** is a backend service built using the NestJS framework to handle the authentication, verification, and authorization of sensitive documents such as academic degrees, certificates, and licenses. The system allows users and organizations to upload and manage documents securely, utilizing cryptographic hashing to ensure document authenticity. The platform also supports multi-level authorizations and revocations, providing robust functionality for document verification across multiple entities.

This API is designed for applications where high security and multiple verification levels are required, such as academic institutions, governmental bodies, and organizations that require document validation.

## Features

- **User & Organization Account Management**:
  - Public account registration for users and organizations.
  - Admin-only creation of admin accounts.
  - Role-based access control (RBAC) ensures that users, organizations, and admins have appropriate permissions for their roles.
  - Two-Factor Authentication (2FA) setup for users and organizations for enhanced security.
- **Document Upload & Submission**:

  - Users can upload various documents (e.g., degrees, certificates) through a secure process.
  - Documents are initially stored without cryptographic hashes. The hash is generated only when an organization authorizes the document, ensuring that the document remains untampered before the verification process.

- **Multi-Level Document Authorization**:

  - Documents can be verified and authorized by multiple entities, such as universities, police departments, foreign ministries, and embassies.
  - The system supports revocation of authorization, and the document's verification status is updated accordingly.
  - Each verification and authorization action is securely logged for auditing purposes.

- **Document Verification**:

  - Users, organizations, and third parties can verify the authenticity of a document by uploading it again to the system. The system re-generates a hash and compares it with the stored hash for verification.

- **Audit Trails & Logging**:

  - All actions, such as document uploads, verifications, authorizations, and revocations, are logged in a secure audit trail for administrators to review.
  - Logs can be reviewed to track all actions performed on documents, enhancing transparency and accountability.

- **Security**:
  - JWT-based authentication for secure, stateless user sessions.
  - AES encryption is used for sensitive data, ensuring protection both at rest and in transit.
  - Role-based access control (RBAC) and permissions management for different user levels (Users, Organizations, Admins).
  - 2FA setup for users and organizations to enhance login security.

## Tech Stack

- **Framework**: NestJS (Node.js Framework) for building scalable and maintainable server-side applications.
- **Database**: PostgreSQL is used as the primary database for storing document metadata, user information, and audit logs.
- **Authentication & Security**:
  - **JWT**: JSON Web Tokens are used for stateless authentication.
  - **2FA**: Two-Factor Authentication is implemented using TOTP (Time-based One-Time Password) via Google Authenticator or similar apps.
  - **Encryption**: AES encryption ensures that all sensitive data is protected.
  - **Cryptographic Hashing**: SHA-256 is used to generate document hashes for verification.
- **API Documentation**: Swagger for API documentation and testing.
- **Testing**: Unit and integration tests are implemented using Jest to ensure robust application performance.

## Project Structure

```bash
cert-api/
|-- .env
|-- .eslintrc.js
|-- .gitignore
|-- .prettierrc
|-- .vscode/
    |-- settings.json
|-- README.md
|-- list_project_structure.py
|-- nest-cli.json
|-- package.json
|-- src/
    |-- main.ts
    |-- app.module.ts                 # Root module
    |-- app.controller.ts             # Root controller
    |-- app.service.ts                # Root service
    |-- app.controller.spec.ts
    |-- common/                       # Shared modules and utilities
        |-- decorators/
            |-- public.decorator.ts
            |-- response-message.decorator.ts
            |-- roles.decorator.ts
        |-- filters/
            |-- global-exception.filter.ts
            |-- http-exception.filter.ts
        |-- guards/
            |-- jwt-auth.guard.ts
            |-- roles.guard.ts
        |-- interceptors/
            |-- transform.interceptor.ts
            |-- logging.interceptor.ts
        |-- interfaces/
            |-- IBaseEntity.ts
            |-- IBaseRepository.ts
            |-- ICustomeResponse.ts
            |-- IPagination.ts
        |-- services/
            |-- cache.service.ts
            |-- logger.service.ts
        |-- utils/
            |-- mask-utils.ts
            |-- pagination-utils.ts
            |-- serialization-utils.ts
    |-- config/
        |-- swagger.config.ts
        |-- typeorm.config.ts
    |-- core/                         # Core business logic and entities
        |-- database/
            |-- database.module.ts
            |-- database.service.ts
        |-- repository/
            |-- base.repository.ts
        |-- entities/
            |-- address.entity.ts
            |-- base.entity.ts        # Base entity class
        |-- services/
            |-- database-logger.service.ts
    |-- modules/
        |-- auth/                     # Authentication module
            |-- auth.module.ts
            |-- auth.service.ts
            |-- auth.controller.ts
            |-- dto/
                |-- login.dto.ts
                |-- register.dto.ts
                |-- auth-response.dto.ts
            |-- strategies/
                |-- jwt.strategy.ts
            |-- guards/
                |-- jwt-auth.guard.ts
            |-- interfaces/
                |-- jwt-payload.interface.ts
        |-- health/                   # Health check module
            |-- health.module.ts
            |-- health.controller.ts
            |-- health.controller.spec.ts
            |-- documentation/
                |-- health.controller.documentation.ts
            |-- indicators/
                |-- custom.health.ts
        |-- users/                    # Users module
            |-- users.module.ts
            |-- controllers/
                |-- users.controller.ts
                |-- users.controller.spec.ts
            |-- services/
                |-- users.service.ts
                |-- seed.service.ts
            |-- repository/
                |-- users.repository.ts
            |-- entities/
                |-- user.entity.ts
                |-- user-preference.entity.ts
                |-- login-history.entity.ts
                |-- user-role.enum.ts
                |-- user-status.enum.ts
            |-- dtos/
                |-- create-user.dto.ts
                |-- update-user.dto.ts
                |-- user-response.dto.ts
                |-- auth-response.dto.ts
                |-- user.mapper.ts
            |-- documentation/
                |-- user.dto.documentation.ts
                |-- users.controller.documentation.ts
            |-- pipes/
                |-- unique-user-validation.pipe.ts
            |-- validations/
                |-- user.validation.ts
            |-- enums/
                |-- provider-types.enum.ts
            |-- interfaces/
                |-- user.interface.ts
        |-- organizations/            # Organizations module
            |-- organizations.module.ts
            |-- controllers/
                |-- organizations.controller.ts
            |-- services/
                |-- organizations.service.ts
            |-- repository/
                |-- organizations.repository.ts
            |-- entities/
                |-- organization.entity.ts
                |-- organization-status.enum.ts
            |-- dtos/
                |-- create-organization.dto.ts
                |-- update-organization.dto.ts
                |-- organization-response.dto.ts
            |-- documentation/
                |-- organization.dto.documentation.ts
                |-- organizations.controller.documentation.ts
            |-- validations/
                |-- organization.validation.ts
            |-- interfaces/
                |-- organization.interface.ts
        |-- documents/                # Documents module
            |-- documents.module.ts
            |-- controllers/
                |-- documents.controller.ts
            |-- services/
                |-- documents.service.ts
            |-- repository/
                |-- documents.repository.ts
            |-- entities/
                |-- document.entity.ts
                |-- document-status.enum.ts
            |-- dtos/
                |-- upload-document.dto.ts
                |-- update-document.dto.ts
                |-- document-response.dto.ts
            |-- documentation/
                |-- document.dto.documentation.ts
                |-- documents.controller.documentation.ts
            |-- validations/
                |-- document.validation.ts
            |-- interfaces/
                |-- document.interface.ts
        |-- notifications/            # Notifications module
            |-- notifications.module.ts
            |-- controllers/
                |-- notifications.controller.ts
            |-- services/
                |-- notifications.service.ts
            |-- repository/
                |-- notifications.repository.ts
            |-- entities/
                |-- notification.entity.ts
                |-- notification-type.enum.ts
                |-- notification-status.enum.ts
            |-- dtos/
                |-- create-notification.dto.ts
                |-- notification-response.dto.ts
            |-- documentation/
                |-- notification.dto.documentation.ts
                |-- notifications.controller.documentation.ts
            |-- validations/
                |-- notification.validation.ts
            |-- interfaces/
                |-- notification.interface.ts
        |-- verifications/            # Verifications module
            |-- verifications.module.ts
            |-- controllers/
                |-- verifications.controller.ts
            |-- services/
                |-- verifications.service.ts
            |-- repository/
                |-- verifications.repository.ts
            |-- entities/
                |-- verification.entity.ts
                |-- verification-status.enum.ts
            |-- dtos/
                |-- create-verification.dto.ts
                |-- update-verification.dto.ts
                |-- verification-response.dto.ts
            |-- documentation/
                |-- verification.dto.documentation.ts
                |-- verifications.controller.documentation.ts
            |-- validations/
                |-- verification.validation.ts
            |-- interfaces/
                |-- verification.interface.ts
    |-- server.ts
|-- test/
    |-- app.e2e-spec.ts
    |-- jest-e2e.json
|-- tsconfig.build.json
|-- tsconfig.json
|-- yarn.lock

```

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-repo/cert-api.git
   cd cert-api
   ```

2. **Install dependencies**:

   ```bash
   yarn install
   ```

3. **Set up environment variables**:

   - Create a `.env.development`, `.env.production`, and `.env.test` file in the root directory.
   - Example content for `.env.development`:

     ```bash
     DATABASE_HOST=localhost
     DATABASE_PORT=5432
     DATABASE_USERNAME=your_username
     DATABASE_PASSWORD=your_password
     JWT_SECRET=your_jwt_secret
     ```

4. **Run migrations** (if using a database schema):

   ```bash
   yarn typeorm migration:run
   ```

5. **Start the development server**:

   ```bash
   yarn start:dev
   ```

## API Endpoints

| Method | Endpoint                    | Description                      | Role         |
| ------ | --------------------------- | -------------------------------- | ------------ |
| POST   | `/auth/register`            | Register a new user/organization | Public       |
| POST   | `/auth/login`               | Login to the system              | Public       |
| POST   | `/documents/upload`         | Upload a document                | User         |
| PATCH  | `/documents/:id/authorize`  | Authorize a document             | Organization |
| POST   | `/documents/:id/verify`     | Verify a document                | User         |
| GET    | `/admin/users`              | List all users                   | Admin        |
| PATCH  | `/admin/users/:id/activate` | Activate a user account          | Admin        |

## Testing

Run unit and integration tests with:

```bash
yarn test
```

To run specific tests:

```bash
yarn test:unit
yarn test:integration
```

## Security

- **JWT Authentication**: Token-based authentication with short-lived tokens.
- **2FA (Two-Factor Authentication)**: Supports 2FA for users and organizations for enhanced security.
- **Encryption**: All sensitive data is encrypted using AES.
- **Rate Limiting**: Implement rate limiting to prevent abuse.
- **CORS**: Configurable Cross-Origin Resource Sharing (CORS) for security.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
