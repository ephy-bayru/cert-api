import { OrganizationUser } from '@modules/organizations/entities/organization-user.entity';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { QueryRunner } from 'typeorm';

export class OrganizationQueries {
  static async updateMetadata(
    queryRunner: QueryRunner,
    organizationId: string,
    path: string,
    value: any,
  ): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .update(Organization)
      .set({
        metadata: () => `
          jsonb_set(
            COALESCE(metadata, '{}'),
            '{${path}}',
            :value::jsonb
          )
        `,
      })
      .where('id = :id', { id: organizationId })
      .setParameter('value', JSON.stringify(value))
      .execute();
  }

  static async updateActivityLog(
    queryRunner: QueryRunner,
    organizationUserId: string,
    path: string,
    value: any,
  ): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .update(OrganizationUser)
      .set({
        activityLog: () => `
          jsonb_set(
            COALESCE("activityLog", '{}'),
            '{${path}}',
            :value::jsonb
          )
        `,
      })
      .where('id = :id', { id: organizationUserId })
      .setParameter('value', JSON.stringify(value))
      .execute();
  }

  static createTimestampUpdate(field: string): string {
    return `to_jsonb(CURRENT_TIMESTAMP::text)`;
  }

  static buildJsonbObject(data: Record<string, any>): string {
    const entries = Object.entries(data)
      .map(([key, value]) => {
        if (value === 'CURRENT_TIMESTAMP') {
          return `'${key}', to_jsonb(CURRENT_TIMESTAMP::text)`;
        }
        return `'${key}', to_jsonb(:${key})`;
      })
      .join(', ');

    return `jsonb_build_object(${entries})`;
  }
}
