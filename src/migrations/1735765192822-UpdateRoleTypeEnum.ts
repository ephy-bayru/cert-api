import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRoleTypeEnum1735765192822 implements MigrationInterface {
    name = 'UpdateRoleTypeEnum1735765192822'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a2221233e86db832853ca88072"`);
        await queryRunner.query(`ALTER TYPE "public"."organization_users_role_enum" RENAME TO "organization_users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."organization_users_role_enum" AS ENUM('PLATFORM_SUPER_ADMIN', 'PLATFORM_ADMIN', 'SUPPORT', 'ORG_SUPER_ADMIN', 'ORG_ADMIN', 'DOCUMENT_MANAGER', 'VERIFIER', 'REVIEWER', 'MEMBER', 'VIEWER', 'AUDITOR', 'TEMPORARY', 'END_USER')`);
        await queryRunner.query(`ALTER TABLE "organization_users" ALTER COLUMN "role" TYPE "public"."organization_users_role_enum" USING "role"::"text"::"public"."organization_users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "organization_users" ALTER COLUMN "role" SET DEFAULT 'MEMBER'`);
        await queryRunner.query(`DROP TYPE "public"."organization_users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "organization_users" ALTER COLUMN "role" SET DEFAULT 'MEMBER'`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('PLATFORM_SUPER_ADMIN', 'PLATFORM_ADMIN', 'SUPPORT', 'ORG_SUPER_ADMIN', 'ORG_ADMIN', 'DOCUMENT_MANAGER', 'VERIFIER', 'REVIEWER', 'MEMBER', 'VIEWER', 'AUDITOR', 'TEMPORARY', 'END_USER')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'END_USER'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."admin_users_role_enum" RENAME TO "admin_users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."admin_users_role_enum" AS ENUM('PLATFORM_SUPER_ADMIN', 'PLATFORM_ADMIN', 'SUPPORT', 'ORG_SUPER_ADMIN', 'ORG_ADMIN', 'DOCUMENT_MANAGER', 'VERIFIER', 'REVIEWER', 'MEMBER', 'VIEWER', 'AUDITOR', 'TEMPORARY', 'END_USER')`);
        await queryRunner.query(`ALTER TABLE "admin_users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "admin_users" ALTER COLUMN "role" TYPE "public"."admin_users_role_enum" USING "role"::"text"::"public"."admin_users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "admin_users" ALTER COLUMN "role" SET DEFAULT 'PLATFORM_ADMIN'`);
        await queryRunner.query(`DROP TYPE "public"."admin_users_role_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."admin_users_role_enum_old" AS ENUM('ADMIN', 'SUPER_ADMIN', 'SUPPORT')`);
        await queryRunner.query(`ALTER TABLE "admin_users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "admin_users" ALTER COLUMN "role" TYPE "public"."admin_users_role_enum_old" USING "role"::"text"::"public"."admin_users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "admin_users" ALTER COLUMN "role" SET DEFAULT 'ADMIN'`);
        await queryRunner.query(`DROP TYPE "public"."admin_users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."admin_users_role_enum_old" RENAME TO "admin_users_role_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('ADMIN', 'USER')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "organization_users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`CREATE TYPE "public"."organization_users_role_enum_old" AS ENUM('ADMIN', 'AUDITOR', 'DOCUMENT_MANAGER', 'MEMBER', 'REVIEWER', 'SUPER_ADMIN', 'TEMPORARY', 'VERIFIER', 'VIEWER')`);
        await queryRunner.query(`ALTER TABLE "organization_users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "organization_users" ALTER COLUMN "role" TYPE "public"."organization_users_role_enum_old" USING "role"::"text"::"public"."organization_users_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."organization_users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."organization_users_role_enum_old" RENAME TO "organization_users_role_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_a2221233e86db832853ca88072" ON "organization_users" ("role") `);
    }

}
