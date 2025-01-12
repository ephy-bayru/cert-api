import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UploadDocumentDto } from '../dtos/upload-document.dto';

@ValidatorConstraint({ name: 'AtLeastOneOwnership', async: false })
export class AtLeastOneOwnershipValidator
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments): boolean {
    const dto = args.object as UploadDocumentDto;
    // Ensure either ownerId or uploadingOrganizationId is provided (or both)
    return !!(dto.ownerId || dto.uploadingOrganizationId);
  }

  defaultMessage(args: ValidationArguments): string {
    return `You must provide either "ownerId" or "uploadingOrganizationId" (or both).`;
  }
}
