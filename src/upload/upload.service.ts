
import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {

    // Helper to configure multer options
    getMulterOptions() {
        return {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(mp3|wav|m4a|mp4)$/)) {
                    return callback(new Error('Only audio/video files are allowed!'), false);
                }
                callback(null, true);
            },
        };
    }
}
