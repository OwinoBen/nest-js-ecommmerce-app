import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto, AuthLoginDto } from "./dto";

import * as argon from 'argon2' // for encryption better option than bcrypt
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";



@Injectable()
export class AuthService{
    constructor(private prisma: PrismaService, private jwt: JwtService, private config:ConfigService){

    }
    async signUp(dto: AuthDto){
        try {
            // generate the password hash
            const hash = await argon.hash(dto.password)
            // save the user informaation in the db
            const user = await this.prisma.user.create({
                data:{
                    email:dto.email,
                    firstname:dto.firstname,
                    lastname:dto.lastname,
                    hash,
                    is_admin:dto.is_admin,
                    is_super_user:dto.is_super_user
                },
                // select:{
                //     id:true,
                // }

            })
            delete user.hash
            // return the saved user
            return this.signToken(user.id, user.email)
        } catch (error) {
            if(error instanceof PrismaClientKnownRequestError){
                //CHECK FOR DUPLICATTE ENTRY
                if(error.code === 'P2002'){
                    throw new ForbiddenException('Credentials already exists')
                }
            }
            throw error
        }
        
    }

    async signIn(dto:AuthLoginDto){
        //find the user by email
        const user = await this.prisma.user.findUnique({
            where:{
                email: dto.email
            }
        })
        //if the user does not exis throw exception
        if(!user){
            throw new ForbiddenException(
                'Invalid login credentials'
            )
        }else if(!user.isActive){
            throw new ForbiddenException('Account is not active. Please contact the service admin to activate your account')
        }else{

            //compare passwords
            const matchPssword = await argon.verify(user.hash, dto.password)
            //if password is incoorect throw exception
            if(!matchPssword){
                throw new ForbiddenException(
                    'Invalid login credentials'
                )
            }
    
            return this.signToken(user.id, user.email)
        }
    }

    async signToken(userId: number, email:string) : Promise<{ 
        access_token: string}>{
        const payload ={
            sub:userId,
            email
        }
        const token =  await this.jwt.signAsync(payload,{
            expiresIn: '15m',
            secret: this.config.get('JWT_SECRET')
        })
        return{
            access_token:token,
        }
    }
}