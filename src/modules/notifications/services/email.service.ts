import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-ses';
import { EmailTemplateService } from './email-template.service';

@Injectable()
export class EmailService {
  private readonly sesClient: SESClient;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials are not properly configured');
    }

    this.sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const senderEmail = this.configService.get<string>('SES_SENDER_EMAIL');
    if (!senderEmail) {
      throw new Error('SES_SENDER_EMAIL is not configured');
    }

    const params: SendEmailCommandInput = {
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: body,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: senderEmail,
    };

    try {
      const command = new SendEmailCommand(params);
      const result = await this.sesClient.send(command);
      this.logger.log(`Email sent successfully to ${to}: ${result.MessageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendAccountVerificationEmail(
    to: string,
    username: string,
    verificationLink: string,
  ): Promise<void> {
    const { subject, body } =
      this.emailTemplateService.getAccountVerificationEmail(
        username,
        verificationLink,
      );
    await this.sendEmail(to, subject, body);
  }

  async sendAdminNewUserNotificationEmail(
    to: string,
    username: string,
    email: string,
    registrationDate: string,
  ): Promise<void> {
    const adminDashboardLink = this.getConfigValue(
      'ADMIN_DASHBOARD_LINK',
      'Admin dashboard link not configured',
    );
    const { subject, body } =
      this.emailTemplateService.getAdminNewUserNotificationEmail(
        username,
        email,
        registrationDate,
        adminDashboardLink,
      );
    await this.sendEmail(to, subject, body);
  }

  async sendAdminNewOrganizationNotificationEmail(
    to: string,
    orgName: string,
    email: string,
    registrationDate: string,
    orgType: string,
  ): Promise<void> {
    const adminDashboardLink = this.getConfigValue(
      'ADMIN_DASHBOARD_LINK',
      'Admin dashboard link not configured',
    );
    const { subject, body } =
      this.emailTemplateService.getAdminNewOrganizationNotificationEmail(
        orgName,
        email,
        registrationDate,
        orgType,
        adminDashboardLink,
      );
    await this.sendEmail(to, subject, body);
  }

  async sendDocumentSubmissionNotificationEmail(
    to: string,
    orgName: string,
    documentTitle: string,
    submitterName: string,
    submissionDate: string,
    documentType: string,
  ): Promise<void> {
    const verificationLink = this.getConfigValue(
      'DOCUMENT_VERIFICATION_LINK',
      'Document verification link not configured',
    );
    const { subject, body } =
      this.emailTemplateService.getDocumentSubmissionNotificationEmail(
        orgName,
        documentTitle,
        submitterName,
        submissionDate,
        documentType,
        verificationLink,
      );
    await this.sendEmail(to, subject, body);
  }

  async sendDocumentStatusUpdateEmail(
    to: string,
    username: string,
    documentTitle: string,
    newStatus: string,
    updateDate: string,
    updatedBy: string,
  ): Promise<void> {
    const documentLink = this.getConfigValue(
      'DOCUMENT_DETAILS_LINK',
      'Document details link not configured',
    );
    const { subject, body } =
      this.emailTemplateService.getDocumentStatusUpdateEmail(
        username,
        documentTitle,
        newStatus,
        updateDate,
        updatedBy,
        documentLink,
      );
    await this.sendEmail(to, subject, body);
  }

  async sendPasswordResetEmail(
    to: string,
    username: string,
    resetLink: string,
  ): Promise<void> {
    const { subject, body } = this.emailTemplateService.getPasswordResetEmail(
      username,
      resetLink,
    );
    await this.sendEmail(to, subject, body);
  }

  private getConfigValue(key: string, errorMessage: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      this.logger.error(`Configuration error: ${errorMessage}`);
      throw new Error(errorMessage);
    }
    return value;
  }
}
