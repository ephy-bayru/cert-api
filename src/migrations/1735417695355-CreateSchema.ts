import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSchema1735417695355 implements MigrationInterface {
    name = 'CreateSchema1735417695355'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isTestUser" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isTestUser"`);
    }

}
