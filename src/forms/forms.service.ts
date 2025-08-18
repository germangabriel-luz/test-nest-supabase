import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';

@Injectable()
export class FormsService {
  async create(createFormDto: CreateFormDto) {
    const { data, error } = await supabase
      .from('forms')
      .insert([createFormDto])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findAll() {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: number) {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`Form with id ${id} not found`);
    return data;
  }

  async update(id: number, updateFormDto: UpdateFormDto) {
    const { data, error } = await supabase
      .from('forms')
      .update(updateFormDto)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new NotFoundException(`Form with id ${id} not found`);
    return data;
  }

  async remove(id: number) {
    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', id);

    if (error) throw new NotFoundException(`Form with id ${id} not found`);
    return { message: `Form ${id} deleted successfully` };
  }
}
