import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) { }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createFormDto: CreateFormDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    console.log(image)
    return this.formsService.create(createFormDto, image);
  }

  @Get()
  findAll() {
    return this.formsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.formsService.update(+id, updateFormDto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.formsService.remove(+id);
  }
}
