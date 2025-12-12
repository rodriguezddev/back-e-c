import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import {ExtractJwt} from 'passport-jwt'
import { jwtConstants } from "../constants";
import { UsuariosService } from "src/usuarios/usuarios.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt'){
    constructor(
        private usuarioService:UsuariosService
    ){
        super(
            {
                jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
                ignoreExpiration:false,
                secretOrKey:jwtConstants.secret
            }
        )
    }

    async validate(payload: any):Promise<any> {
        try{
            const authUser = await this.usuarioService.findOne(payload.sub)
            return {
                sub:authUser.id,
                username:authUser.username,
                rol:authUser.rol,
                profileId:authUser.perfil?.id ?? undefined
            }
        }
        catch (e){
            throw new UnauthorizedException('Usuario no esta autenticado.')
        }
    }
}