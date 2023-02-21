import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string

    @IsString()
    @IsNotEmpty()
    firstname: string

    @IsString()
    @IsNotEmpty()
    lastname: string

    @IsOptional()
    @IsBoolean()
    is_admin?: boolean

    @IsOptional()
    @IsBoolean()
    is_super_user?: boolean
}