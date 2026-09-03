import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateObjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;
}
