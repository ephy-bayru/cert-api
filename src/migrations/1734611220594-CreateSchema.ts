import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSchema1734611220594 implements MigrationInterface {
    name = 'CreateSchema1734611220594'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."login_history_status_enum" AS ENUM('SUCCESS', 'FAILURE')`);
        await queryRunner.query(`CREATE TABLE "login_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."login_history_status_enum" NOT NULL, "ipAddress" character varying, "userAgent" character varying, "failureReason" character varying, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_fe377f36d49c39547cb6b9f0727" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_911ecf99e0f1a95668fea7cd6d" ON "login_history" ("userId") `);
        await queryRunner.query(`CREATE TYPE "public"."organization_users_role_enum" AS ENUM('SUPER_ADMIN', 'ADMIN', 'DOCUMENT_MANAGER', 'VERIFIER', 'REVIEWER', 'MEMBER', 'VIEWER', 'AUDITOR', 'TEMPORARY')`);
        await queryRunner.query(`CREATE TABLE "organization_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "email" character varying(150) NOT NULL, "userName" character varying(100) NOT NULL, "password" character varying NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT false, "resetPasswordToken" character varying, "resetPasswordExpires" TIMESTAMP, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "middleName" character varying(100), "phoneNumber" character varying(20), "profileImageUrl" character varying(255), "title" character varying(100), "department" character varying(100), "employeeId" character varying(100), "role" "public"."organization_users_role_enum" NOT NULL, "permissions" jsonb NOT NULL DEFAULT '{}', "isActive" boolean NOT NULL DEFAULT false, "lastLogin" TIMESTAMP, "failedLoginAttempts" integer NOT NULL DEFAULT '0', "isLocked" boolean NOT NULL DEFAULT false, "lockedAt" TIMESTAMP, "lockExpiresAt" TIMESTAMP, "twoFactorEnabled" boolean NOT NULL DEFAULT false, "twoFactorSecret" character varying, "lastAccess" TIMESTAMP, "activityLog" jsonb, "preferences" jsonb NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "version" integer NOT NULL, "createdBy" uuid, "updatedBy" uuid, "deactivatedAt" TIMESTAMP, "deactivatedBy" uuid, "deactivationReason" character varying(500), "restrictions" jsonb, "certifications" jsonb, CONSTRAINT "UQ_9876d228f18638a2ff7c43b0dc2" UNIQUE ("organizationId", "userName"), CONSTRAINT "UQ_2e902d55dec5eb00aeda13982b8" UNIQUE ("organizationId", "email"), CONSTRAINT "PK_af79a22d50256af35812ba60a87" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_26f83117dea41b00841385b982" ON "organization_users" ("organizationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1e5736b0e40136f7eccd656bb9" ON "organization_users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_a2221233e86db832853ca88072" ON "organization_users" ("role") `);
        await queryRunner.query(`CREATE INDEX "IDX_6596d0de290c451d5aec95a92e" ON "organization_users" ("isActive") `);
        await queryRunner.query(`CREATE TYPE "public"."verifications_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'ADDITIONAL_INFO_REQUIRED', 'VERIFIED', 'REJECTED', 'EXPIRED', 'REVOKED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "verifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "document_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "initiated_by_id" uuid NOT NULL, "reviewed_by_id" uuid, "status" "public"."verifications_status_enum" NOT NULL DEFAULT 'PENDING', "comments" text, "rejectionReason" character varying, "reviewedAt" TIMESTAMP, "reviewAttempts" integer NOT NULL DEFAULT '0', "blockchainTransactionId" character varying, "blockchainMetadata" jsonb, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP, "assignedTo" character varying, "verificationSteps" jsonb, CONSTRAINT "PK_2127ad1b143cf012280390b01d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d5917a39ddd5ab92d386e3cd43" ON "verifications" ("document_id", "organization_id") `);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('UPLOAD_DOCUMENT', 'UPDATE_DOCUMENT', 'DELETE_DOCUMENT', 'VERIFY_DOCUMENT', 'REVOKE_DOCUMENT', 'DOCUMENT_STATUS_CHANGED', 'DOCUMENT_SUBMITTED_FOR_VERIFICATION', 'DOCUMENT_VERIFICATION_APPROVED', 'DOCUMENT_VERIFICATION_REJECTED', 'DOCUMENT_REVOCATION_REQUESTED', 'DOCUMENT_REVOKED', 'GRANT_DOCUMENT_ACCESS', 'REVOKE_DOCUMENT_ACCESS', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'ACTIVATE_USER', 'DEACTIVATE_USER', 'APPROVE_USER', 'REJECT_USER', 'SUSPEND_USER', 'UNSUSPEND_USER', 'GRANT_ADMIN_ROLE', 'REVOKE_ADMIN_ROLE', 'CREATE_ORGANIZATION', 'UPDATE_ORGANIZATION', 'DELETE_ORGANIZATION', 'APPROVE_ORGANIZATION', 'REJECT_ORGANIZATION', 'SUSPEND_ORGANIZATION', 'UNSUSPEND_ORGANIZATION', 'USER_LOGIN', 'USER_LOGOUT', 'FAILED_LOGIN_ATTEMPT', 'PASSWORD_RESET', 'INITIATE_VERIFICATION', 'COMPLETE_VERIFICATION', 'REJECT_VERIFICATION', 'SYSTEM_ERROR', 'CONFIGURATION_CHANGE', 'SUPER_ADMIN_LOGIN', 'MODIFY_SYSTEM_SETTINGS', 'VIEW_AUDIT_LOGS', 'EXPORT_AUDIT_LOGS')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" "public"."audit_logs_action_enum" NOT NULL, "entityType" character varying(100) NOT NULL, "entityId" character varying, "performedById" uuid, "performedAt" TIMESTAMP NOT NULL DEFAULT now(), "metadata" jsonb, "ipAddress" character varying, "userAgent" character varying, "status" character varying, "details" text, "documentId" uuid, "organizationId" uuid, "blockchainTransactionHash" character varying, "blockchainBlockNumber" integer, "blockchainTimestamp" TIMESTAMP, "documentVersion" integer, "sequenceNumber" integer, "verificationDetails" jsonb, "previousStatus" character varying, "newStatus" character varying, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cee5459245f652b75eb2759b4c" ON "audit_logs" ("action") `);
        await queryRunner.query(`CREATE INDEX "IDX_01993ae76b293d3b866cc3a125" ON "audit_logs" ("entityType") `);
        await queryRunner.query(`CREATE INDEX "IDX_f23279fad63453147a8efb46cf" ON "audit_logs" ("entityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_371007aca0b12c07d6d2dbdb83" ON "audit_logs" ("performedById") `);
        await queryRunner.query(`CREATE INDEX "IDX_57680dda80b2d5c8967f2b50af" ON "audit_logs" ("performedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_2cd2aa2c66b222e290ca7bc80a" ON "audit_logs" ("documentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3a645514b2c9b8be4c350e5d73" ON "audit_logs" ("sequenceNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_12bff7e8585028d4ad84af287f" ON "audit_logs" ("documentId", "performedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_f073e58bdc719017777fb30e1a" ON "audit_logs" ("performedAt", "action") `);
        await queryRunner.query(`CREATE INDEX "IDX_13c69424c440a0e765053feb4b" ON "audit_logs" ("entityType", "entityId") `);
        await queryRunner.query(`CREATE TYPE "public"."documents_document_type_enum" AS ENUM('ACADEMIC_CERTIFICATE', 'ACADEMIC_TRANSCRIPT', 'DEGREE_CERTIFICATE', 'DIPLOMA', 'COURSE_CERTIFICATE', 'THESIS_DOCUMENT', 'GOVERNMENT_ID', 'PASSPORT', 'DRIVERS_LICENSE', 'BIRTH_CERTIFICATE', 'MARRIAGE_CERTIFICATE', 'TAX_DOCUMENT', 'VISA_DOCUMENT', 'CITIZENSHIP_DOCUMENT', 'PROFESSIONAL_LICENSE', 'CERTIFICATION', 'WORK_PERMIT', 'EMPLOYMENT_CONTRACT', 'REFERENCE_LETTER', 'EXPERIENCE_CERTIFICATE', 'CORPORATE_DOCUMENT', 'BUSINESS_LICENSE', 'INCORPORATION_CERTIFICATE', 'SHAREHOLDER_AGREEMENT', 'ANNUAL_REPORT', 'BOARD_RESOLUTION', 'LEGAL_DOCUMENT', 'CONTRACT', 'POWER_OF_ATTORNEY', 'COURT_ORDER', 'AFFIDAVIT', 'LEGAL_NOTICE', 'MEDICAL_CERTIFICATE', 'HEALTH_RECORD', 'VACCINATION_RECORD', 'INSURANCE_DOCUMENT', 'BANK_STATEMENT', 'FINANCIAL_STATEMENT', 'AUDIT_REPORT', 'TAX_RETURN', 'PROPERTY_DEED', 'LEASE_AGREEMENT', 'PROPERTY_TAX_DOCUMENT', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."documents_status_enum" AS ENUM('DRAFT', 'SUBMITTED', 'IN_QUEUE', 'PENDING_VERIFICATION', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'VERIFIED', 'REJECTED', 'REVOKED', 'EXPIRED', 'PENDING_RENEWAL', 'UNDER_DISPUTE', 'ARCHIVED', 'PENDING_DELETION')`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(200) NOT NULL, "description" text, "document_type" "public"."documents_document_type_enum", "tags" text, "file_url" character varying NOT NULL, "file_hash" character varying NOT NULL, "file_size" bigint NOT NULL, "file_type" character varying(100) NOT NULL, "status" "public"."documents_status_enum" NOT NULL DEFAULT 'DRAFT', "expiry_date" date, "owner_id" character varying NOT NULL, "uploader_id" character varying NOT NULL, "verification_statuses" jsonb, "access_history" jsonb, "blockchain_tx_hash" character varying, "blockchain_metadata" jsonb, "version" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "submitted_at" TIMESTAMP, "last_verified_at" TIMESTAMP, "revoked_at" TIMESTAMP, "archived_at" TIMESTAMP, "latest_audit_log_id" character varying, "metadata" jsonb, "is_deleted" boolean NOT NULL DEFAULT false, "ownerId" uuid, "uploaderId" uuid, CONSTRAINT "CHK_f66042c0c2d931d043df6e2204" CHECK ("file_size" > 0), CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_553906d54e4e79077bc641a648" ON "documents" ("title") `);
        await queryRunner.query(`CREATE INDEX "IDX_b882920680255cd1f3fcca0efe" ON "documents" ("document_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_2aab7c12d8ec1207288771bf42" ON "documents" ("file_hash") `);
        await queryRunner.query(`CREATE INDEX "IDX_e7c994ee1f8428c185a8c6eeca" ON "documents" ("file_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_709389d904fa03bdf5ec84998d" ON "documents" ("status") `);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('EMAIL', 'SMS', 'IN_APP', 'PUSH')`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_status_enum" AS ENUM('UNREAD', 'READ', 'ARCHIVED', 'PENDING', 'SENT', 'FAILED')`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_priority_enum" AS ENUM('LOW', 'NORMAL', 'HIGH')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."notifications_type_enum" NOT NULL, "message" text NOT NULL, "readAt" TIMESTAMP, "actionUrl" character varying, "status" "public"."notifications_status_enum" NOT NULL DEFAULT 'UNREAD', "priority" "public"."notifications_priority_enum" NOT NULL DEFAULT 'NORMAL', "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "organizationId" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_692a909ee0fa9383e7859f9b40" ON "notifications" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_928914a0743f50e6f83a90cdda" ON "notifications" ("organizationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_831a5a06f879fb0bebf8965871" ON "notifications" ("createdAt") `);
        await queryRunner.query(`CREATE TYPE "public"."organizations_status_enum" AS ENUM('ACTIVE', 'VERIFIED', 'SUSPENDED', 'DEACTIVATED', 'PENDING_APPROVAL', 'PENDING_VERIFICATION', 'UNDER_REVIEW', 'COMPLIANCE_HOLD', 'ARCHIVED', 'DELETED')`);
        await queryRunner.query(`CREATE TABLE "organizations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "contactEmail" character varying(150), "contactPhoneNumber" character varying(20), "industry" character varying(100), "foundedDate" date, "description" text, "website" character varying(255), "logoUrl" character varying(255), "status" "public"."organizations_status_enum" NOT NULL DEFAULT 'PENDING_APPROVAL', "verifiedAt" TIMESTAMP, "verifiedBy" character varying, "complianceInfo" jsonb, "settings" jsonb NOT NULL DEFAULT '{}', "blockchainAddress" character varying(42), "blockchainMetadata" jsonb, "metadata" jsonb NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "version" integer NOT NULL, "createdBy" character varying, "updatedBy" character varying, "deletedBy" character varying, "addressId" uuid, CONSTRAINT "UQ_8ca1f6dbd6d9ea63f0b1574cfba" UNIQUE ("name", "deletedAt"), CONSTRAINT "REL_25b6541b65a1e6d380b6f0f785" UNIQUE ("addressId"), CONSTRAINT "CHK_016b6fa0fc3bfba260a914d0a7" CHECK ("contactEmail" IS NOT NULL OR "contactPhoneNumber" IS NOT NULL), CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9b7ca6d30b94fef571cff87688" ON "organizations" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_dddca86b0d0228f0c0ccf40867" ON "organizations" ("contactEmail") WHERE "contactEmail" IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5474fecbbe40d7afcd36ecb5cf" ON "organizations" ("contactPhoneNumber") WHERE "contactPhoneNumber" IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_f4dccde1e9bf9c86fa98c267a3" ON "organizations" ("industry") `);
        await queryRunner.query(`CREATE INDEX "IDX_f3770f157bd77d83ab022e92fc" ON "organizations" ("status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_da53510a956fb2f578ab369578" ON "organizations" ("blockchainAddress") `);
        await queryRunner.query(`CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "streetAddress" character varying(255), "city" character varying(100), "state" character varying(100), "country" character varying(100), "postalCode" character varying(20), "region" character varying(100), "zone" character varying(100), "subCity" character varying(100), "woreda" character varying(100), "phoneNumber" character varying(20), "userId" uuid, "organizationId" uuid, CONSTRAINT "REL_95c93a584de49f0b0e13f75363" UNIQUE ("userId"), CONSTRAINT "REL_a454949b57e2b5a100ca60db01" UNIQUE ("organizationId"), CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_preferences_themepreference_enum" AS ENUM('LIGHT', 'DARK', 'SYSTEM')`);
        await queryRunner.query(`CREATE TABLE "user_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "receiveEmailNotifications" boolean NOT NULL DEFAULT true, "receiveSmsNotifications" boolean NOT NULL DEFAULT true, "receivePushNotifications" boolean NOT NULL DEFAULT true, "receiveMarketingEmails" boolean NOT NULL DEFAULT true, "receiveProductUpdates" boolean NOT NULL DEFAULT true, "receiveSecurityAlerts" boolean NOT NULL DEFAULT true, "language" character varying NOT NULL DEFAULT 'en', "timezone" character varying NOT NULL DEFAULT 'UTC', "themePreference" "public"."user_preferences_themepreference_enum" NOT NULL DEFAULT 'DARK', "darkModeEnabled" boolean NOT NULL DEFAULT false, "use24HourClock" boolean NOT NULL DEFAULT false, "personalizedContent" boolean NOT NULL DEFAULT true, "shareActivityStatus" boolean NOT NULL DEFAULT true, "showOnlineStatus" boolean NOT NULL DEFAULT true, "rememberDevice" boolean NOT NULL DEFAULT false, "sessionTimeoutInMinutes" integer NOT NULL DEFAULT '30', "userId" uuid, CONSTRAINT "REL_b6202d1cacc63a0b9c8dac2abd" UNIQUE ("userId"), CONSTRAINT "PK_e8cfb5b31af61cd363a6b6d7c25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_provider_enum" AS ENUM('local', 'jwt')`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'PENDING_ACTIVATION', 'SUSPENDED', 'ARCHIVED', 'DELETED', 'LOCKED', 'PASSWORD_RESET_REQUIRED', 'TWO_FACTOR_REQUIRED', 'UNDER_REVIEW', 'FLAGGED')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(150) NOT NULL, "password" character varying NOT NULL, "firstName" character varying(100), "lastName" character varying(100), "surname" character varying(100), "userName" character varying(100), "phoneNumber" character varying(20), "dateOfBirth" date, "gender" character varying(20), "fcn" character varying(16), "fin" character varying(12), "provider" "public"."users_provider_enum" NOT NULL DEFAULT 'local', "isVerified" boolean NOT NULL DEFAULT false, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "twoFactorEnabled" boolean NOT NULL DEFAULT false, "twoFactorSecret" character varying, "resetPasswordToken" character varying, "resetPasswordExpires" TIMESTAMP, "emailVerificationToken" character varying, "status" "public"."users_status_enum" NOT NULL DEFAULT 'PENDING_ACTIVATION', "lastLogin" TIMESTAMP, "failedLoginAttempts" integer NOT NULL DEFAULT '0', "isAccountLocked" boolean NOT NULL DEFAULT false, "blockchainAddress" character varying(42), "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedBy" character varying, "locale" character varying NOT NULL DEFAULT 'en', "termsAcceptedAt" TIMESTAMP, "consentGivenAt" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_226bb9aa7aa8a69991209d58f59" UNIQUE ("userName"), CONSTRAINT "UQ_1e3d0240b49c40521aaeb953293" UNIQUE ("phoneNumber"), CONSTRAINT "UQ_8fef567d6d80d804b06984a0dcc" UNIQUE ("fcn"), CONSTRAINT "UQ_1f92c049aa2e2ea258dcb36ee5b" UNIQUE ("fin"), CONSTRAINT "UQ_4af7d933aa24f349e37f1d66ce7" UNIQUE ("blockchainAddress"), CONSTRAINT "UQ_ea04b5c86ca92e78612d558076d" UNIQUE ("email", "userName", "fcn", "fin"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_226bb9aa7aa8a69991209d58f5" ON "users" ("userName") `);
        await queryRunner.query(`CREATE INDEX "IDX_1e3d0240b49c40521aaeb95329" ON "users" ("phoneNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_3676155292d72c67cd4e090514" ON "users" ("status") `);
        await queryRunner.query(`CREATE TYPE "public"."admin_users_role_enum" AS ENUM('SUPER_ADMIN', 'ADMIN', 'SUPPORT')`);
        await queryRunner.query(`CREATE TABLE "admin_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(150) NOT NULL, "password" character varying NOT NULL, "firstName" character varying(100), "lastName" character varying(100), "phoneNumber" character varying(100), "role" "public"."admin_users_role_enum" NOT NULL DEFAULT 'ADMIN', "isActive" boolean NOT NULL DEFAULT false, "isLocked" boolean NOT NULL DEFAULT false, "failedLoginAttempts" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "version" integer NOT NULL, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, CONSTRAINT "UQ_dcd0c8a4b10af9c986e510b9ecc" UNIQUE ("email"), CONSTRAINT "PK_06744d221bb6145dc61e5dc441d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "document_user_access" ("document_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_8134d8172247c58c225d7599844" PRIMARY KEY ("document_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_81bff484fe3e66896ca79ad40e" ON "document_user_access" ("document_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4ac2d839934fda5aefa89b2dfc" ON "document_user_access" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "document_organization_access" ("document_id" uuid NOT NULL, "organization_id" uuid NOT NULL, CONSTRAINT "PK_06644a3a4585091745ad03d1bd6" PRIMARY KEY ("document_id", "organization_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a02b42726c767651cf45594bfb" ON "document_organization_access" ("document_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_45c6aa88c7334dde2d5d39adc5" ON "document_organization_access" ("organization_id") `);
        await queryRunner.query(`ALTER TABLE "login_history" ADD CONSTRAINT "FK_911ecf99e0f1a95668fea7cd6d8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_users" ADD CONSTRAINT "FK_26f83117dea41b00841385b9821" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "verifications" ADD CONSTRAINT "FK_319dae747acfc15e61ec012a87c" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "verifications" ADD CONSTRAINT "FK_1472033f19eb669aa22f277fcbd" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "verifications" ADD CONSTRAINT "FK_5ebd28b8deb23516499b575afe2" FOREIGN KEY ("initiated_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "verifications" ADD CONSTRAINT "FK_aa21e27e4785b85202aa4f5db82" FOREIGN KEY ("reviewed_by_id") REFERENCES "organization_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_371007aca0b12c07d6d2dbdb83a" FOREIGN KEY ("performedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_2cd2aa2c66b222e290ca7bc80a1" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_2d031e6155834882f54dcd6b4f5" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_4106f2a9b30c9ff2f717894a970" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_befd700a02312da4cc725ccaace" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_928914a0743f50e6f83a90cdda9" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD CONSTRAINT "FK_25b6541b65a1e6d380b6f0f7858" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_a454949b57e2b5a100ca60db019" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_preferences" ADD CONSTRAINT "FK_b6202d1cacc63a0b9c8dac2abd4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_user_access" ADD CONSTRAINT "FK_81bff484fe3e66896ca79ad40ec" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "document_user_access" ADD CONSTRAINT "FK_4ac2d839934fda5aefa89b2dfc2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_organization_access" ADD CONSTRAINT "FK_a02b42726c767651cf45594bfb9" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "document_organization_access" ADD CONSTRAINT "FK_45c6aa88c7334dde2d5d39adc5e" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_organization_access" DROP CONSTRAINT "FK_45c6aa88c7334dde2d5d39adc5e"`);
        await queryRunner.query(`ALTER TABLE "document_organization_access" DROP CONSTRAINT "FK_a02b42726c767651cf45594bfb9"`);
        await queryRunner.query(`ALTER TABLE "document_user_access" DROP CONSTRAINT "FK_4ac2d839934fda5aefa89b2dfc2"`);
        await queryRunner.query(`ALTER TABLE "document_user_access" DROP CONSTRAINT "FK_81bff484fe3e66896ca79ad40ec"`);
        await queryRunner.query(`ALTER TABLE "user_preferences" DROP CONSTRAINT "FK_b6202d1cacc63a0b9c8dac2abd4"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_a454949b57e2b5a100ca60db019"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP CONSTRAINT "FK_25b6541b65a1e6d380b6f0f7858"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_928914a0743f50e6f83a90cdda9"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_befd700a02312da4cc725ccaace"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_4106f2a9b30c9ff2f717894a970"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_2d031e6155834882f54dcd6b4f5"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_2cd2aa2c66b222e290ca7bc80a1"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_371007aca0b12c07d6d2dbdb83a"`);
        await queryRunner.query(`ALTER TABLE "verifications" DROP CONSTRAINT "FK_aa21e27e4785b85202aa4f5db82"`);
        await queryRunner.query(`ALTER TABLE "verifications" DROP CONSTRAINT "FK_5ebd28b8deb23516499b575afe2"`);
        await queryRunner.query(`ALTER TABLE "verifications" DROP CONSTRAINT "FK_1472033f19eb669aa22f277fcbd"`);
        await queryRunner.query(`ALTER TABLE "verifications" DROP CONSTRAINT "FK_319dae747acfc15e61ec012a87c"`);
        await queryRunner.query(`ALTER TABLE "organization_users" DROP CONSTRAINT "FK_26f83117dea41b00841385b9821"`);
        await queryRunner.query(`ALTER TABLE "login_history" DROP CONSTRAINT "FK_911ecf99e0f1a95668fea7cd6d8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_45c6aa88c7334dde2d5d39adc5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a02b42726c767651cf45594bfb"`);
        await queryRunner.query(`DROP TABLE "document_organization_access"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4ac2d839934fda5aefa89b2dfc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_81bff484fe3e66896ca79ad40e"`);
        await queryRunner.query(`DROP TABLE "document_user_access"`);
        await queryRunner.query(`DROP TABLE "admin_users"`);
        await queryRunner.query(`DROP TYPE "public"."admin_users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3676155292d72c67cd4e090514"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1e3d0240b49c40521aaeb95329"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_226bb9aa7aa8a69991209d58f5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_provider_enum"`);
        await queryRunner.query(`DROP TABLE "user_preferences"`);
        await queryRunner.query(`DROP TYPE "public"."user_preferences_themepreference_enum"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_da53510a956fb2f578ab369578"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f3770f157bd77d83ab022e92fc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f4dccde1e9bf9c86fa98c267a3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5474fecbbe40d7afcd36ecb5cf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dddca86b0d0228f0c0ccf40867"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9b7ca6d30b94fef571cff87688"`);
        await queryRunner.query(`DROP TABLE "organizations"`);
        await queryRunner.query(`DROP TYPE "public"."organizations_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_831a5a06f879fb0bebf8965871"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_928914a0743f50e6f83a90cdda"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_692a909ee0fa9383e7859f9b40"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_709389d904fa03bdf5ec84998d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e7c994ee1f8428c185a8c6eeca"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2aab7c12d8ec1207288771bf42"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b882920680255cd1f3fcca0efe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_553906d54e4e79077bc641a648"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TYPE "public"."documents_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."documents_document_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_13c69424c440a0e765053feb4b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f073e58bdc719017777fb30e1a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_12bff7e8585028d4ad84af287f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3a645514b2c9b8be4c350e5d73"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2cd2aa2c66b222e290ca7bc80a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_57680dda80b2d5c8967f2b50af"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_371007aca0b12c07d6d2dbdb83"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f23279fad63453147a8efb46cf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_01993ae76b293d3b866cc3a125"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cee5459245f652b75eb2759b4c"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d5917a39ddd5ab92d386e3cd43"`);
        await queryRunner.query(`DROP TABLE "verifications"`);
        await queryRunner.query(`DROP TYPE "public"."verifications_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6596d0de290c451d5aec95a92e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a2221233e86db832853ca88072"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1e5736b0e40136f7eccd656bb9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_26f83117dea41b00841385b982"`);
        await queryRunner.query(`DROP TABLE "organization_users"`);
        await queryRunner.query(`DROP TYPE "public"."organization_users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_911ecf99e0f1a95668fea7cd6d"`);
        await queryRunner.query(`DROP TABLE "login_history"`);
        await queryRunner.query(`DROP TYPE "public"."login_history_status_enum"`);
    }

}
