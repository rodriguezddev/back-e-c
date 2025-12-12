import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import {ExtractJwt} from 'passport-jwt'
import { jwtConstants } from "../constants";
import { UsuariosService } from "src/usuarios/usuarios.service";
import { Request } from "express";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy,'jwt-refresh'){
    constructor(
        private usuarioService:UsuariosService
    ){
        super(
            {
                jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
                ignoreExpiration:false,
                passReqToCallback:true,
                secretOrKey:jwtConstants.refreshSecret
            }
        )
    }

    async validate(req:Request,payload: any):Promise<any> {
        try{
            const refreshToken:string|undefined = req.get('authorization')?.replace('Bearer','').trim()
            
            const authUser = await this.usuarioService.findOne(payload.sub)
            return {
                sub:authUser.id,
                username:authUser.username,
                rol:authUser.rol,
                profileId:authUser.perfil?.id ?? undefined,
                refreshToken,
            }
        }
        catch (e){
            throw new UnauthorizedException('Usuario no esta autenticado.')
        }
    }
}