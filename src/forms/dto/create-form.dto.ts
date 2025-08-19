import { IsOptional, IsString } from 'class-validator';

export class CreateFormDto {
  @IsString()
  user_uuid:string;

  @IsString()
  procedure_type: string;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  image?: string; 
}
