import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSchema1735417915271 implements MigrationInterface {
    name = 'CreateSchema1735417915271'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isTestUser" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isTestUser"`);
    }

}
