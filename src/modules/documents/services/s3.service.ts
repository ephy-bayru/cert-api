import { Injectable } from '@nestjs/common';
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

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly defaultKmsKeyId: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION')!;
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET')!;
    this.defaultKmsKeyId = this.configService.get<string>('AWS_KMS_KEY_ID');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        )!,
      },
    });
  }

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

    if (encryptionType === EncryptionType.SSE_S3) {
      uploadParams.ServerSideEncryption = 'AES256';
    } else if (encryptionType === EncryptionType.SSE_KMS) {
      uploadParams.ServerSideEncryption = 'aws:kms';
      uploadParams.SSEKMSKeyId = kmsKeyId ?? this.defaultKmsKeyId;
    }

    await this.s3Client.send(new PutObjectCommand(uploadParams));
    return key;
  }

  async generatePresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }

  async listFiles(prefix: string = '', maxKeys = 100): Promise<string[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });
    const response = await this.s3Client.send(command);
    const keys = (response.Contents?.map((c) => c.Key) ?? []).filter(
      (k): k is string => k !== undefined,
    );
    return keys;
  }

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
    await this.s3Client.send(new CopyObjectCommand(copyParams));
  }
}
