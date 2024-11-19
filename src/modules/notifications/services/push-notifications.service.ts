import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BatchResponse } from '../interfaces/notification.interface';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private provider: PushNotificationService;

  constructor(private readonly configService: ConfigService) {
    this.initializeProvider();
  }

  private initializeProvider() {
    const providerType = this.configService.get<string>(
      'PUSH_NOTIFICATION_PROVIDER',
    );

    switch (providerType) {
      case 'onesignal':
        // this.provider = new OneSignalProvider(this.configService);
        break;
      case 'amazon-sns':
        // this.provider = new AmazonSNSProvider(this.configService);
        break;
      // Add other cases for different providers
      default:
        throw new Error(
          `Unsupported push notification provider: ${providerType}`,
        );
    }
  }

  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<string> {
    try {
      const response = await this.provider.sendPushNotification(
        token,
        title,
        body,
        data,
      );
      this.logger.log(`Successfully sent push notification: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending push notification', error.stack);
      throw new Error(`Failed to send push notification: ${error.message}`);
    }
  }

  async sendMulticastPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<BatchResponse> {
    try {
      const response = await this.provider.sendMulticastPushNotification(
        tokens,
        title,
        body,
        data,
      );
      this.logger.log(
        `Successfully sent multicast push notification: ${response.successCount} successful, ${response.failureCount} failed`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error sending multicast push notification',
        error.stack,
      );
      throw new Error(
        `Failed to send multicast push notification: ${error.message}`,
      );
    }
  }

  async sendTopicPushNotification(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<string> {
    try {
      const response = await this.provider.sendTopicPushNotification(
        topic,
        title,
        body,
        data,
      );
      this.logger.log(`Successfully sent topic push notification: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending topic push notification', error.stack);
      throw new Error(
        `Failed to send topic push notification: ${error.message}`,
      );
    }
  }

  async subscribeToTopic(token: string, topic: string): Promise<void> {
    try {
      await this.provider.subscribeToTopic(token, topic);
      this.logger.log(`Successfully subscribed token to topic: ${topic}`);
    } catch (error) {
      this.logger.error('Error subscribing to topic', error.stack);
      throw new Error(`Failed to subscribe to topic: ${error.message}`);
    }
  }

  async unsubscribeFromTopic(token: string, topic: string): Promise<void> {
    try {
      await this.provider.unsubscribeFromTopic(token, topic);
      this.logger.log(`Successfully unsubscribed token from topic: ${topic}`);
    } catch (error) {
      this.logger.error('Error unsubscribing from topic', error.stack);
      throw new Error(`Failed to unsubscribe from topic: ${error.message}`);
    }
  }
}
