import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Res,
    Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto, QueryDocumentsDto } from './dto/document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post()
    @ApiOperation({ summary: 'Upload a document' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                name: { type: 'string' },
                type: { type: 'string', enum: ['RAPPORT', 'CR_REUNION', 'ADMINISTRATIF', 'PROJET'] },
                projectId: { type: 'string' },
                description: { type: 'string' },
            },
            required: ['file', 'type', 'projectId'],
        },
    })
    @Roles(Role.ADMIN, Role.CHEF_PROJET)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/documents',
                filename: (req, file, cb) => {
                    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
                    cb(null, uniqueName);
                },
            }),
            limits: { fileSize: MAX_FILE_SIZE },
            fileFilter: (req, file, cb) => {
                if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error('Type de fichier non autorisé'), false);
                }
            },
        }),
    )
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body() createDto: CreateDocumentDto,
        @CurrentUser() user: any,
    ) {
        const userId = user.userId ?? user.sub;
        return this.documentsService.create(createDto, file, userId, user.role);
    }

    @Get()
    @ApiOperation({ summary: 'List all documents with filters' })
    async findAll(
        @Query() query: QueryDocumentsDto,
        @CurrentUser() user: any,
    ) {
        const userId = user.userId ?? user.sub;
        return this.documentsService.findAll(query, userId, user.role);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get document details' })
    async findOne(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ) {
        const userId = user.userId ?? user.sub;
        return this.documentsService.findOne(id, userId, user.role);
    }

    @Get(':id/download')
    @ApiOperation({ summary: 'Download a document' })
    async download(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Res() res: Response,
    ) {
        const userId = user.userId ?? user.sub;
        const result = await this.documentsService.download(id, userId, user.role);
        res.download(result.path, result.name);
    }

    @Get(':id/history')
    @ApiOperation({ summary: 'Get document version history' })
    @Roles(Role.ADMIN, Role.CHEF_PROJET)
    async getHistory(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ) {
        const userId = user.userId ?? user.sub;
        return this.documentsService.getHistory(id, userId, user.role);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update document (new version if file provided)' })
    @ApiConsumes('multipart/form-data')
    @Roles(Role.ADMIN, Role.CHEF_PROJET)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/documents',
                filename: (req, file, cb) => {
                    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
                    cb(null, uniqueName);
                },
            }),
            limits: { fileSize: MAX_FILE_SIZE },
            fileFilter: (req, file, cb) => {
                if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error('Type de fichier non autorisé'), false);
                }
            },
        }),
    )
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateDocumentDto,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user: any,
    ) {
        const userId = user.userId ?? user.sub;
        return this.documentsService.update(id, updateDto, file, userId, user.role);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a document' })
    @Roles(Role.ADMIN, Role.CHEF_PROJET)
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ) {
        const userId = user.userId ?? user.sub;
        await this.documentsService.remove(id, userId, user.role);
        return { message: 'Document supprimé avec succès' };
    }
}
