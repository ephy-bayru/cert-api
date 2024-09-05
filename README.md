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
├── .env.development               # Environment variables for development
├── .env.production                # Environment variables for production
├── .env.test                      # Environment variables for testing
├── .gitignore                     # Git ignore file
├── README.md                      # Project documentation
├── package.json                   # Dependencies and project metadata
├── tsconfig.json                  # TypeScript configuration
├── index.ts                       # Main entry point
├── app.ts                         # App initialization
├── server.ts                      # Server initialization
├── src/
│   ├── core/
│   │   ├── common/
│   │   │   ├── entities/          # Core data models
│   │   │   │   └── BaseModel.ts   # Base model for data entities
│   │   │   ├── interfaces/        # Interface definitions
│   │   │   │   ├── IPaginationOptions.ts
│   │   │   │   └── IPaginatedData.ts
│   │   │   ├── constants/         # Constant values
│   │   │   │   ├── rateLimit.ts
│   │   │   │   └── permissions.ts
│   │   │   ├── errors/            # Custom error handling
│   │   │   │   ├── CustomError.ts
│   │   │   │   └── CustomMongoError.ts
│   │   │   ├── repositories/      # Generic repository structure
│   │   │   │   ├── IGenericRepository.ts
│   │   │   │   └── GenericRepository.ts
│   │   │   ├── validations/       # Common validations
│   │   │   │   └── commonValidation.ts
│   │   │   ├── dto/               # Data transfer objects
│   │   │   │   └── PaginationDTO.ts
│   │   │   └── mappers/           # Data mappers for transformations
│   │   │       └── GenericMapper.ts
│   │   └── users/                 # User-specific models, services, and repositories
│   │       ├── entities/
│   │       │   └── User.ts
│   │       ├── value_objects/
│   │       │   ├── Email.ts
│   │       │   └── Password.ts
│   │       ├── repositories/
│   │       │   ├── IUserRepository.ts
│   │       │   └── UserRepository.ts
│   │       ├── validations/
│   │       │   └── userValidation.ts
│   │       ├── dto/
│   │       │   ├── UserDTO.ts
│   │       │   └── UserRegistrationDTO.ts
│   │       └── mappers/
│   │           └── UserMapper.ts
│   ├── application/
│   │   ├── services/              # Application services
│   │   │   └── UserService.ts
│   │   └── validations/           # Validations specific to application logic
│   │       ├── RegisterUserValidation.ts
│   │       └── LoginUserValidation.ts
│   └── infrastructure/
│       ├── web/
│       │   ├── controllers/       # API controllers for HTTP requests
│       │   │   └── UserController.ts
│       │   ├── routes/            # API route configurations
│       │   │   └── user.routes.ts
│       │   └── middlewares/       # Middleware for various purposes
│       │       ├── error.middleware.ts
│       │       ├── validationMiddleware.ts
│       │       ├── rateLimit.middleware.ts
│       │       ├── authenticate.middleware.ts
│       │       ├── refreshToken.middleware.ts
│       │       └── seedData.middleware.ts
│       ├── persistence/
│       │   ├── schemas/           # Database schema definitions
│       │   │   └── userSchema.ts
│       │   └── repositories/      # Database repository implementations
│       │       └── BaseRepository.ts
│       ├── external_services/     # External API services
│       │   └── RandomUserAPI.ts
│       ├── security/
│       │   ├── CorsConfig.ts
│       │   └── CSPConfig.ts
│       └── common/
│           ├── utils/             # Common utility functions
│           │   ├── logger.util.ts
│           │   ├── cache.util.ts
│           │   ├── rateLimiter.util.ts
│           │   └── passwordHash.ts
│           └── helpers/           # Helper functions
│               ├── httpResponse.helper.ts
│               ├── checkIfTokenIsBlacklisted.ts
│               └── pagination.helper.ts
├── tests/                         # Test cases
│   ├── unit/                      # Unit tests
│   │   └── users/
│   │       └── specificFile.test.ts
│   └── integration/               # Integration tests
│       └── auth/
│           └── specificFile.test.ts
└── docs/
    └── swagger/
        └── swagger.yaml           # Swagger API documentation
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
