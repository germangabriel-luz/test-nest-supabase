import { Injectable, BadRequestException } from '@nestjs/common';
import { supabase } from 'src/supabase/supabase.client';
import { FormsLog } from './entities/forms_log.entity'; 

@Injectable()
export class FormsLogsService {

  async findAll(): Promise<FormsLog[]> {
    const { data: logs, error } = await supabase
      .from('forms_logs')
      .select('*')

    if (error) {
      console.error('Error fetching all forms logs:', error);
      throw new BadRequestException(`Error fetching forms logs: ${error.message}`);
    }
    return logs as FormsLog[];
  }

  async findOne(id: string): Promise<FormsLog> {
    const { data: log, error } = await supabase 
      .from('forms_logs')
      .select('*')
      .eq('id', id)
      .single(); 
    if (error) {
      console.error(`Error fetching forms log with ID ${id}:`, error);
      if (error.code === 'PGRST116') { // PGRST116 is the error code for "No rows found" in PostgREST
        throw new BadRequestException(`Forms log with ID "${id}" not found.`);
      }
      throw new BadRequestException(`Error fetching forms log: ${error.message}`);
    }
    return log as FormsLog;
  }

  async remove(id: string): Promise<void> {
    const { error: deleteError } = await supabase
      .from('forms_logs') 
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error(`Error deleting forms log with ID ${id}:`, deleteError);
      throw new BadRequestException(`Could not delete forms log ${id}: ${deleteError.message}`);
    }
    return console.log(`Form log deleted id: ${id}`)
  }
}
