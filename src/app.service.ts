import { Injectable } from '@nestjs/common';
import { supabase } from './supabase/supabase.client';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  async getUsers(){
    const {data,error} = await supabase.from('users').select('*')
    if(error){
      throw new Error(error.message)
    }
    console.log(data)
    return data
  }
}
