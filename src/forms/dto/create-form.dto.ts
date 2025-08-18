import { IsOptional, IsString } from 'class-validator';

export class CreateFormDto {
  @IsString()
  procedure_type: string;

  @IsString()
  @IsOptional()
  diagnosis?: string;
}
