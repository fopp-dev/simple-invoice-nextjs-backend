import { Controller, HttpStatus, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UploadService } from './upload.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileUploadDto } from './dto/file-upload.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('api/upload')
export class UploadController {

  constructor(
    private readonly uploadService: UploadService,
  ) {
  }

  @ApiTags('upload')
  @Post('')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload audio, video or pdf file here',
    type: FileUploadDto,
  })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads-temp'
      , filename: (req, file, cb) => {
        // Generating a 32 random chars long string
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        //Calling the callback passing the random name generated with the original extension name
        cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  uploadFile(@UploadedFile() file, @Req() req: any, @Res() res: any) {
    const path = file.path;

    return res.status(HttpStatus.OK).json({
      statusCode: 200,
      response: {
        path
      },
    });
  }
}
