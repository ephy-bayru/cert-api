import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'responseMessage';

export function ResponseMessage(message: string): CustomDecorator<string> {
  if (typeof message !== 'string' || message.trim() === '') {
    throw new Error(
      'ResponseMessage decorator requires a non-empty string message',
    );
  }
  return SetMetadata(RESPONSE_MESSAGE_KEY, message.trim());
}
