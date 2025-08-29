import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports:[ 
    /* Files checker  */
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 1024 * 1024 * 5, 
      },
      fileFilter: (req, file, cb) => {
        /* Image types */
        if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(null, true); 
        } else {
          cb(new Error('Unsupported file type. Only JPG, JPEG, PNG are allowed!'), false); 
        }
      },
    }),
  ],
  controllers: [FormsController],
  providers: [FormsService],
})
export class FormsModule { }
