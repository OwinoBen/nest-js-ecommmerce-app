import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(private userService: UserService){}
    @Get('profile')
    getUser(@GetUser() user:User){ //@Req() req: Request
        return user
    }
    @Patch('update')
    editUserInfo(@GetUser('id') userId: number, @Body() dto: EditUserDto ){
        return this.userService.editUser(userId, dto)
    }
}
