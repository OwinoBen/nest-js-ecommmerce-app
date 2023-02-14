import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class EditBookMarkDto{
    @IsString()
    @IsOptional()
    tittle?:string

    @IsString()
    @IsOptional()
    description?: string

    @IsString()
    @IsOptional()
    link?:string
}