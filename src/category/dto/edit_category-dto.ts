import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class EditCategoryDto{
    @IsString()
    @IsOptional()
    name?: string

    @IsBoolean()
    @IsOptional()
    verified?: boolean
}