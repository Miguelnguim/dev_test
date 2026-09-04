import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateObjectDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description?: string;
}
