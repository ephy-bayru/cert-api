import {
  NotificationPriority,
  EmailTemplateType,
} from '../enums/notification-priority.enum';

export interface NotificationData {
  recipient: string;
  text: string;
  priority?: NotificationPriority;
}

export interface BaseEmailNotificationData extends NotificationData {
  subject: string;
  username: string;
}

export interface AccountVerificationEmailData
  extends BaseEmailNotificationData {
  emailType: EmailTemplateType.ACCOUNT_VERIFICATION;
  verificationLink: string;
}

export interface AdminNewUserNotificationEmailData
  extends BaseEmailNotificationData {
  emailType: EmailTemplateType.ADMIN_NEW_USER_NOTIFICATION;
  email: string;
  registrationDate: string;
}

export interface AdminNewOrganizationNotificationEmailData
  extends BaseEmailNotificationData {
  emailType: EmailTemplateType.ADMIN_NEW_ORGANIZATION_NOTIFICATION;
  orgName: string;
  email: string;
  registrationDate: string;
  orgType: string;
}

export interface DocumentSubmissionNotificationEmailData
  extends BaseEmailNotificationData {
  emailType: EmailTemplateType.DOCUMENT_SUBMISSION_NOTIFICATION;
  orgName: string;
  documentTitle: string;
  submitterName: string;
  submissionDate: string;
  documentType: string;
}

export interface DocumentStatusUpdateEmailData
  extends BaseEmailNotificationData {
  emailType: EmailTemplateType.DOCUMENT_STATUS_UPDATE;
  documentTitle: string;
  newStatus: string;
  updateDate: string;
  updatedBy: string;
}

export interface PasswordResetEmailData extends BaseEmailNotificationData {
  emailType: EmailTemplateType.PASSWORD_RESET;
  resetLink: string;
}

export type EmailNotificationData =
  | AccountVerificationEmailData
  | AdminNewUserNotificationEmailData
  | AdminNewOrganizationNotificationEmailData
  | DocumentSubmissionNotificationEmailData
  | DocumentStatusUpdateEmailData
  | PasswordResetEmailData;

export function isEmailNotification(
  data: NotificationData,
): data is EmailNotificationData {
  return 'emailType' in data;
}

// Other interfaces remain the same
export interface SMSNotificationData extends NotificationData {
  // SMS-specific properties could be added here
}

export interface PushNotificationData extends NotificationData {
  title: string;
  token: string;
  data?: Record<string, unknown>;
}

export function isPushNotification(
  data: NotificationData,
): data is PushNotificationData {
  return 'title' in data && 'token' in data;
}

export interface BatchResponse {
  successCount: number;
  failureCount: number;
  responses: Array<{ success: boolean; messageId?: string; error?: Error }>;
}
