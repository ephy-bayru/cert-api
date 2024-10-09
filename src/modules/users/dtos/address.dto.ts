import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class AddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  streetAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  zone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subCity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  woreda?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in a valid format.',
  })
  phoneNumber?: string;
}
