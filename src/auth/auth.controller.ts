import { Body, Controller, HttpCode, HttpStatus, Post, Req, Version } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request } from "express";
import { AuthDto, AuthLoginDto } from "./dto";

@Controller('auth')
export class AuthConttoller{
    
    constructor(private authService: AuthService){}
    
    @Version('1')
    @Post('signup')
    // @Req() req: Request=> using this is not recommended because the framework might change
    // use DTO (Data Transfer Object as the alternative)
    signUp(@Body() dto: AuthDto){
        
        return this.authService.signUp(dto)
    }

    // @Version('1')
    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signIn(@Body() dto:AuthLoginDto){
        return this.authService.signIn(dto)
    }
}