import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

@Injectable()
export class SMSService {
  private client: Twilio;
  private readonly logger = new Logger(SMSService.name);

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials are not properly configured');
    }

    this.client = new Twilio(accountSid, authToken);
  }

  async sendSMS(
    to: string,
    body: string,
    from?: string,
  ): Promise<MessageInstance> {
    try {
      const fromNumber =
        from || this.configService.get<string>('TWILIO_PHONE_NUMBER');

      if (!fromNumber) {
        throw new Error('Sender phone number is not configured');
      }

      const message = await this.client.messages.create({
        body,
        to,
        from: fromNumber,
      });

      this.logger.log(`SMS sent successfully to ${to}. SID: ${message.sid}`);
      return message;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}`, error.stack);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async getMessageStatus(messageSid: string): Promise<string> {
    try {
      const message = await this.client.messages(messageSid).fetch();
      return message.status;
    } catch (error) {
      this.logger.error(
        `Failed to get message status for SID ${messageSid}`,
        error.stack,
      );
      throw new Error(`Failed to get message status: ${error.message}`);
    }
  }

  async sendBulkSMS(
    recipients: string[],
    body: string,
    from?: string,
  ): Promise<MessageInstance[]> {
    const sendPromises = recipients.map((recipient) =>
      this.sendSMS(recipient, body, from),
    );
    return Promise.all(sendPromises);
  }

  async scheduleMessage(
    to: string,
    body: string,
    sendAt: Date,
    from?: string,
  ): Promise<MessageInstance> {
    try {
      const fromNumber =
        from || this.configService.get<string>('TWILIO_PHONE_NUMBER');

      if (!fromNumber) {
        throw new Error('Sender phone number is not configured');
      }

      const message = await this.client.messages.create({
        body,
        to,
        from: fromNumber,
        sendAt: sendAt,
        scheduleType: 'fixed',
      });

      this.logger.log(
        `SMS scheduled successfully for ${to}. SID: ${message.sid}`,
      );
      return message;
    } catch (error) {
      this.logger.error(`Failed to schedule SMS for ${to}`, error.stack);
      throw new Error(`Failed to schedule SMS: ${error.message}`);
    }
  }
}
