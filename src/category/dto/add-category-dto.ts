import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class AddCategoryDto{
    @IsString()
    @IsNotEmpty()
    name: string

    @IsBoolean()
    @IsOptional()
    verified?: boolean

}