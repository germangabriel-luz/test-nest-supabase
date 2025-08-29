import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';

@Injectable()
export class FormsService {
  private readonly bucket = 'forms_images';

  async create(createFormDto: CreateFormDto, image?: Express.Multer.File) {
    /* insert without image */
    const { data: form, error: insertError } = await supabase
      .from('forms')
      .insert(createFormDto)
      .select()
      .single();

    if (insertError || !form) {
      throw new BadRequestException(insertError?.message || 'Failed to create form');
    }

    /* if no image return */
    if(!image) console.log(image)
    if (!image) return form;

    const path = `${createFormDto.user_uuid}/${form.id}-${image.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from(this.bucket)
      .upload(path, image.buffer, {
        contentType: image.mimetype,
        upsert: true,
      });

    if (uploadError) {
      /* form exists but image failed */
      throw new BadRequestException(`Image upload failed: ${uploadError.message}`);
    }
    const { data: updatedForm, error: updateError } = await supabase
      .from('forms')
      .update({ image: path })
      .eq('id', form.id)
      .select()
      .single();

    if (updateError) throw new BadRequestException(updateError.message);

    return updatedForm;
  }

  async findAll() {
    const { data: forms, error } = await supabase
      .from('forms')
      .select();

    if (error) throw new BadRequestException(error.message);

    /* for each generate 1 hour signed url */
    for (const form of forms) {
      if (form.image) {
        const { data: signedUrlData } = await supabase.storage
          .from(this.bucket)
          .createSignedUrl(form.image, 60 * 60);

        form.image = signedUrlData?.signedUrl || form.image;
      }
    }

    return forms;
  }


  async findOne(id: number) {
    const { data: form, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !form) throw new NotFoundException(`Form with id ${id} not found`);

    /* if form has image, generate signed URL valid for 1 hour */
    if (form.image) {
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from(this.bucket)
        .createSignedUrl(form.image, 60 * 60);

      if (urlError) throw new BadRequestException(urlError.message);
      form.image = signedUrlData.signedUrl;
    }

    return form;
  }

  async update(id: number, updateFormDto: UpdateFormDto, file?: Express.Multer.File,) {
    /* fetch data */
    const { data: existingForm, error: fetchError } = await supabase
      .from('forms')
      .select('id, image, user_uuid')
      .eq('id', id)
      .single();
    if (fetchError || !existingForm) {
      throw new NotFoundException(`Form with id ${id} not found`);
    }

    let imagePath = existingForm.image;

    /* if there is image */
    if (file) {
      /* if previous image then delete */
      if (existingForm.image) {
        const { error: removeError } = await supabase.storage
          .from(this.bucket)
          .remove([existingForm.image]);

        if (removeError) {
          console.warn(`Could not delete old image: ${removeError.message}`);
        }
      }
      const newPath = `${existingForm.user_uuid}/${existingForm.id}-${file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from(this.bucket)
        .upload(newPath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        throw new BadRequestException(
          `Image upload failed: ${uploadError.message}`,
        );
      }
      imagePath = newPath;
    }

    /* final update with all new fields */
    const { data: updatedForm, error: updateError } = await supabase
      .from('forms')
      .update({ ...updateFormDto, image: imagePath })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException(
        `Failed to update form: ${updateError.message}`,
      );
    }

    return updatedForm;
  }

  async remove(id: number) {
    /* fetch form to check for image */
    const { data: form, error: fetchError } = await supabase
      .from('forms')
      .select('image')
      .eq('id', id)
      .single();
    if (fetchError || !form) {
      throw new NotFoundException(`Form with id ${id} not found`);
    }

    if (form.image) {
      const { error: removeImageError } = await supabase.storage
        .from(this.bucket)
        .remove([form.image]);

      /* if error deleting image delete form and log the error */
      if (removeImageError) {
        console.warn(
          `Could not delete image for form ${id}: ${removeImageError.message}`,
        );
      }
    }

    /* delete */
    const { error: deleteFormError } = await supabase
      .from('forms')
      .delete()
      .eq('id', id);

    if (deleteFormError) {
      throw new BadRequestException(
        `Could not delete form ${id}: ${deleteFormError.message}`,
      );
    }

    return { message: `Form ${id} and associated image deleted successfully` };
  }
}
