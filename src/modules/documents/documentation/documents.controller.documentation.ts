import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Document } from '../entities/document.entity';
import { DocumentStatus } from '../entities/document-status.enum';
import { UpdateDocumentDto } from '../dtos/update-document.dto';
import { UploadDocumentDto } from '../dtos/upload-document.dto';
import { DocumentResponseDto } from '../dtos/document-response.dto';

export function UploadDocumentDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Upload a new document' }),
    ApiBody({ type: UploadDocumentDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'The document has been successfully uploaded.',
      type: DocumentResponseDto,
    }),
  );
}

export function GetDocumentDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a document by ID' }),
    ApiParam({ name: 'id', required: true, description: 'Document ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the document.',
      type: Document,
    }),
  );
}

export function UpdateDocumentDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a document' }),
    ApiParam({ name: 'id', required: true, description: 'Document ID' }),
    ApiBody({ type: UpdateDocumentDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'The document has been successfully updated.',
      type: Document,
    }),
  );
}

export function DeleteDocumentDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a document' }),
    ApiParam({ name: 'id', required: true, description: 'Document ID' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'The document has been successfully deleted.',
    }),
  );
}

export function SubmitDocumentForVerificationDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Submit a document for verification' }),
    ApiParam({ name: 'id', required: true, description: 'Document ID' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          organizationIds: { type: 'array', items: { type: 'string' } },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'The document has been submitted for verification.',
      type: Document,
    }),
  );
}

export function ChangeDocumentStatusDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Change document status' }),
    ApiParam({ name: 'id', required: true, description: 'Document ID' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          newStatus: { enum: Object.values(DocumentStatus) },
          organizationId: { type: 'string' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'The document status has been updated.',
      type: Document,
    }),
  );
}

export function GetDocumentsByUserDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get documents by user' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the documents for the user.',
      type: [Document],
    }),
  );
}

export function GetDocumentsByOrganizationDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get documents by organization' }),
    ApiParam({ name: 'orgId', required: true, description: 'Organization ID' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the documents for the organization.',
      type: [Document],
    }),
  );
}

export function SearchDocumentsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Search documents' }),
    ApiQuery({ name: 'searchTerm', required: false, type: String }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the search results.',
      type: [Document],
    }),
  );
}

export function GrantDocumentAccessDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Grant document access to an organization' }),
    ApiParam({ name: 'id', required: true, description: 'Document ID' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: { organizationId: { type: 'string' } },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Access has been granted.',
    }),
  );
}

export function RevokeDocumentAccessDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Revoke document access from an organization' }),
    ApiParam({ name: 'id', required: true, description: 'Document ID' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: { organizationId: { type: 'string' } },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Access has been revoked.',
    }),
  );
}

export function InitiateReVerificationDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Initiate re-verification of a document' }),
    ApiParam({ name: 'id', required: true, description: 'Document ID' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          organizationIds: { type: 'array', items: { type: 'string' } },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Re-verification has been initiated.',
      type: Document,
    }),
  );
}

export function GetDocumentCompositeStatusDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get composite status of a document' }),
    ApiParam({ name: 'id', required: true, description: 'Document ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the composite status of the document.',
      schema: {
        type: 'object',
        properties: {
          overallStatus: { enum: Object.values(DocumentStatus) },
          organizationStatuses: {
            type: 'object',
            additionalProperties: { enum: Object.values(DocumentStatus) },
          },
        },
      },
    }),
  );
}

export function CountDocumentsByStatusDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get count of documents by status for a user' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the count of documents by status.',
      schema: {
        type: 'object',
        additionalProperties: { type: 'number' },
      },
    }),
  );
}

export function GetRecentDocumentsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get recent documents for a user' }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of recent documents to fetch',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns the recent documents.',
      type: [Document],
    }),
  );
}
