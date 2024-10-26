import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from '../services/documents.service';
import { CreateDocumentDto } from '../dtos/create-document.dto';
import { UpdateDocumentDto } from '../dtos/update-document.dto';
import { Document } from '../entities/document.entity';
import { DocumentStatus } from '../entities/document-status.enum';
import { PaginationResult } from 'src/common/interfaces/IPagination';
import {
  DocumentFilters,
  DocumentSearchParams,
} from '../interfaces/document-filters.interface';
import { User } from '@common/decorators/user.decorator';

import {
  CreateDocumentDocs,
  GetDocumentDocs,
  UpdateDocumentDocs,
  DeleteDocumentDocs,
  SubmitDocumentForVerificationDocs,
  ChangeDocumentStatusDocs,
  GetDocumentsByUserDocs,
  GetDocumentsByOrganizationDocs,
  SearchDocumentsDocs,
  GrantDocumentAccessDocs,
  RevokeDocumentAccessDocs,
  InitiateReVerificationDocs,
  GetDocumentCompositeStatusDocs,
  CountDocumentsByStatusDocs,
  GetRecentDocumentsDocs,
} from '../documentation/documents.controller.documentation';

@ApiTags('Documents')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller({
  path: 'documents',
  version: '1',
})
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @CreateDocumentDocs()
  async createDocument(
    @Body() createDocumentDto: CreateDocumentDto,
    @User('id') userId: string,
  ): Promise<Document> {
    return this.documentsService.createDocument(createDocumentDto, userId);
  }

  @Get(':id')
  @GetDocumentDocs()
  async getDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @User('id') userId: string,
  ): Promise<Document> {
    return this.documentsService.getDocument(id, userId);
  }

  @Put(':id')
  @UpdateDocumentDocs()
  async updateDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @User('id') userId: string,
  ): Promise<Document> {
    return this.documentsService.updateDocument(id, updateDocumentDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteDocumentDocs()
  async deleteDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @User('id') userId: string,
  ): Promise<void> {
    await this.documentsService.deleteDocument(id, userId);
  }

  @Post(':id/submit')
  @SubmitDocumentForVerificationDocs()
  async submitDocumentForVerification(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('organizationIds') organizationIds: string[],
    @User('id') userId: string,
  ): Promise<Document> {
    return this.documentsService.submitDocumentForVerification(
      id,
      organizationIds,
      userId,
    );
  }

  @Put(':id/status')
  @ChangeDocumentStatusDocs()
  async changeDocumentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('newStatus') newStatus: DocumentStatus,
    @Body('organizationId') organizationId: string,
  ): Promise<Document> {
    return this.documentsService.changeDocumentStatus(
      id,
      newStatus,
      organizationId,
    );
  }

  @Get('user')
  @GetDocumentsByUserDocs()
  async getDocumentsByUser(
    @User('id') userId: string,
    @Query() filters: DocumentFilters,
  ): Promise<PaginationResult<Document>> {
    return this.documentsService.getDocumentsByUser(userId, filters);
  }

  @Get('organization/:orgId')
  @GetDocumentsByOrganizationDocs()
  async getDocumentsByOrganization(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Query() filters: DocumentFilters,
  ): Promise<PaginationResult<Document>> {
    return this.documentsService.getDocumentsByOrganization(orgId, filters);
  }

  @Get('search')
  @SearchDocumentsDocs()
  async searchDocuments(
    @Query() searchParams: DocumentSearchParams,
  ): Promise<PaginationResult<Document>> {
    return this.documentsService.searchDocuments(searchParams);
  }

  @Post(':id/grant-access')
  @GrantDocumentAccessDocs()
  async grantDocumentAccess(
    @Param('id', ParseUUIDPipe) documentId: string,
    @Body('organizationId') organizationId: string,
    @User('id') userId: string,
  ): Promise<void> {
    await this.documentsService.grantDocumentAccess(
      documentId,
      organizationId,
      userId,
    );
  }

  @Post(':id/revoke-access')
  @RevokeDocumentAccessDocs()
  async revokeDocumentAccess(
    @Param('id', ParseUUIDPipe) documentId: string,
    @Body('organizationId') organizationId: string,
    @User('id') userId: string,
  ): Promise<void> {
    await this.documentsService.revokeDocumentAccess(
      documentId,
      organizationId,
      userId,
    );
  }

  @Post(':id/re-verify')
  @InitiateReVerificationDocs()
  async initiateReVerification(
    @Param('id', ParseUUIDPipe) documentId: string,
    @Body('organizationIds') organizationIds: string[],
    @User('id') userId: string,
  ): Promise<Document> {
    return this.documentsService.initiateReVerification(
      documentId,
      organizationIds,
      userId,
    );
  }

  @Get(':id/composite-status')
  @GetDocumentCompositeStatusDocs()
  async getDocumentCompositeStatus(
    @Param('id', ParseUUIDPipe) documentId: string,
  ): Promise<{
    overallStatus: DocumentStatus;
    organizationStatuses: Record<string, DocumentStatus>;
  }> {
    return this.documentsService.getDocumentCompositeStatus(documentId);
  }

  @Get('count-by-status')
  @CountDocumentsByStatusDocs()
  async countDocumentsByStatus(
    @User('id') userId: string,
  ): Promise<Record<DocumentStatus, number>> {
    return this.documentsService.countDocumentsByStatus(userId);
  }

  @Get('recent')
  @GetRecentDocumentsDocs()
  async getRecentDocuments(
    @User('id') userId: string,
    @Query('limit') limit: number = 5,
  ): Promise<Document[]> {
    return this.documentsService.getRecentDocuments(userId, limit);
  }
}
