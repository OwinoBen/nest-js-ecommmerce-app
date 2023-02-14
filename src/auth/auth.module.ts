import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthConttoller } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy";

@Module({
    // imports: [PrismaModule], // add if the module is not set to global
    imports: [JwtModule.register({})],
    controllers:[AuthConttoller],
    providers:[AuthService, JwtStrategy]
})
export class AuthModule{}