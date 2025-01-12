import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
  PutObjectCommandInput,
  CopyObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { EncryptionType } from '../entities/encryption-type';
import { LoggerService } from 'src/common/services/logger.service';

/**
 * S3Service handles file operations against AWS S3 with error handling.
 */
@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly defaultKmsKeyId?: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService, // Inject a custom or Nest logger
  ) {
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET', '');
    this.defaultKmsKeyId = this.configService.get<string>('AWS_KMS_KEY_ID');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
          '',
        ),
      },
    });
  }

  /**
   * Uploads a file buffer to S3.
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    folder: string = '',
    encryptionType: EncryptionType = EncryptionType.NONE,
    kmsKeyId?: string,
  ): Promise<string> {
    const key = folder ? `${folder}/${fileName}` : fileName;
    const uploadParams: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      StorageClass: 'STANDARD',
      ContentType: 'application/octet-stream',
    };

    // Handle SSE / SSE-KMS
    if (encryptionType === EncryptionType.SSE_S3) {
      uploadParams.ServerSideEncryption = 'AES256';
    } else if (encryptionType === EncryptionType.SSE_KMS) {
      uploadParams.ServerSideEncryption = 'aws:kms';
      uploadParams.SSEKMSKeyId = kmsKeyId ?? this.defaultKmsKeyId;
    }

    try {
      this.logger.debug(`Uploading file to S3: ${key}`, 'S3Service');
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      this.logger.debug(`Successfully uploaded: ${key}`, 'S3Service');
      return key;
    } catch (error) {
      this.logger.error('Failed to upload file to S3', 'S3Service', { error });
      throw new InternalServerErrorException(
        `Failed to upload file: ${error.message}`,
      );
    }
  }

  /**
   * Generates a presigned URL for the given S3 object key.
   */
  async generatePresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error('Failed to generate presigned URL', 'S3Service', {
        key,
        error,
      });
      throw new InternalServerErrorException(
        `Failed to generate presigned URL: ${error.message}`,
      );
    }
  }

  /**
   * Deletes a file from S3 by key.
   */
  async deleteFile(key: string): Promise<void> {
    try {
      this.logger.debug(`Deleting file from S3: ${key}`, 'S3Service');
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error('Failed to delete file from S3', 'S3Service', {
        key,
        error,
      });
      throw new InternalServerErrorException(
        `Failed to delete file: ${error.message}`,
      );
    }
  }

  /**
   * Lists file keys in the S3 bucket under a given prefix.
   */
  async listFiles(prefix = '', maxKeys = 100): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });
      const response = await this.s3Client.send(command);
      return (
        (response.Contents?.map((c) => c.Key).filter(Boolean) as string[]) || []
      );
    } catch (error) {
      this.logger.error('Failed to list files in S3', 'S3Service', {
        prefix,
        error,
      });
      throw new InternalServerErrorException(
        `Failed to list files: ${error.message}`,
      );
    }
  }

  /**
   * Copies a file within/between S3 buckets.
   */
  async copyFile(
    sourceKey: string,
    destinationKey: string,
    sourceBucket: string = this.bucketName,
    destinationBucket: string = this.bucketName,
  ): Promise<void> {
    const copyParams: CopyObjectCommandInput = {
      CopySource: `${sourceBucket}/${sourceKey}`,
      Bucket: destinationBucket,
      Key: destinationKey,
    };

    try {
      this.logger.debug(
        `Copying file in S3 from ${sourceKey} to ${destinationKey}`,
        'S3Service',
      );
      await this.s3Client.send(new CopyObjectCommand(copyParams));
    } catch (error) {
      this.logger.error('Failed to copy file in S3', 'S3Service', {
        sourceKey,
        destinationKey,
        error,
      });
      throw new InternalServerErrorException(
        `Failed to copy file: ${error.message}`,
      );
    }
  }

  /**
   * Checks S3 connectivity by attempting a simple list operation.
   */
  async checkConnection(): Promise<boolean> {
    try {
      // Attempt to list 1 item from the root prefix
      await this.listFiles('', 1);
      return true;
    } catch (error) {
      this.logger.warn('S3 connection check failed', 'S3Service', { error });
      return false;
    }
  }
}
