import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { EmailTemplateType } from '../enums/notification-priority.enum';

@Injectable()
export class EmailTemplateService {
  private templates: Map<EmailTemplateType, HandlebarsTemplateDelegate> =
    new Map();

  constructor(private configService: ConfigService) {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    const templateDir = this.configService.get<string>(
      'EMAIL_TEMPLATE_DIR',
      'src/email-templates',
    );

    Object.values(EmailTemplateType).forEach((templateType) => {
      const templatePath = path.join(templateDir, `${templateType}.hbs`);
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      this.templates.set(templateType, Handlebars.compile(templateContent));
    });
  }

  private renderTemplate(templateType: EmailTemplateType, data: any): string {
    const template = this.templates.get(templateType);
    if (!template) {
      throw new Error(`Template not found: ${templateType}`);
    }
    return template(data);
  }

  getAccountVerificationEmail(
    username: string,
    verificationLink: string,
  ): { subject: string; body: string } {
    const subject = 'Verify Your Account';
    const body = this.renderTemplate(EmailTemplateType.ACCOUNT_VERIFICATION, {
      username,
      verificationLink,
    });
    return { subject, body };
  }

  getAdminNewUserNotificationEmail(
    username: string,
    email: string,
    registrationDate: string,
    adminDashboardLink: string,
  ): { subject: string; body: string } {
    const subject = 'New User Registration';
    const body = this.renderTemplate(
      EmailTemplateType.ADMIN_NEW_USER_NOTIFICATION,
      {
        username,
        email,
        registrationDate,
        adminDashboardLink,
      },
    );
    return { subject, body };
  }

  getAdminNewOrganizationNotificationEmail(
    orgName: string,
    email: string,
    registrationDate: string,
    orgType: string,
    adminDashboardLink: string,
  ): { subject: string; body: string } {
    const subject = 'New Organization Registration';
    const body = this.renderTemplate(
      EmailTemplateType.ADMIN_NEW_ORGANIZATION_NOTIFICATION,
      {
        orgName,
        email,
        registrationDate,
        orgType,
        adminDashboardLink,
      },
    );
    return { subject, body };
  }

  getDocumentSubmissionNotificationEmail(
    orgName: string,
    documentTitle: string,
    submitterName: string,
    submissionDate: string,
    documentType: string,
    verificationLink: string,
  ): { subject: string; body: string } {
    const subject = 'New Document Submitted for Verification';
    const body = this.renderTemplate(
      EmailTemplateType.DOCUMENT_SUBMISSION_NOTIFICATION,
      {
        orgName,
        documentTitle,
        submitterName,
        submissionDate,
        documentType,
        verificationLink,
      },
    );
    return { subject, body };
  }

  getDocumentStatusUpdateEmail(
    username: string,
    documentTitle: string,
    newStatus: string,
    updateDate: string,
    updatedBy: string,
    documentLink: string,
  ): { subject: string; body: string } {
    const subject = 'Document Status Update';
    const body = this.renderTemplate(EmailTemplateType.DOCUMENT_STATUS_UPDATE, {
      username,
      documentTitle,
      newStatus,
      updateDate,
      updatedBy,
      documentLink,
    });
    return { subject, body };
  }

  getPasswordResetEmail(
    username: string,
    resetLink: string,
  ): { subject: string; body: string } {
    const subject = 'Password Reset Request';
    const body = this.renderTemplate(EmailTemplateType.PASSWORD_RESET, {
      username,
      resetLink,
    });
    return { subject, body };
  }
}
