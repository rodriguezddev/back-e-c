import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { MailerService } from '@nestjs-modules/mailer';
import { jwtConstants } from './constants';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { EntityNotFoundError } from 'typeorm';
import { UsuarioEntity } from 'src/usuarios/entities/usuario.entity';
import { Rol } from 'src/usuarios/enum/rol.enum';
import { Tokens } from './types/tokens.type';
import { SignUpDto } from './dto/signUp.dto';



@Injectable()
export class AuthService {

    constructor(
        private readonly usuariosService:UsuariosService,
        private readonly jwtService:JwtService,
        private readonly mailerService:MailerService,
    ){}

    async getTokens(usuario:{sub:number,username:string,rol:Rol,profileId?:number}):Promise<Tokens>{
        const payload = {
            sub:usuario.sub,
            username:usuario.username,
            rol:usuario.rol
        }
        if (usuario.profileId) payload['profileId'] = usuario.profileId

        const accessToken:string = await this.jwtService.signAsync(payload,{expiresIn:"1d",secret:jwtConstants.secret})//cambiar
        const refreshToken:string = await this.jwtService.signAsync(payload,{expiresIn:'7d',secret:jwtConstants.refreshSecret})

        return {
            accessToken,
            refreshToken
        }
    }

    async updateRefreshTokenHash(usuarioId:number,refreshToken:string){
        const refreshTokenHashed:string = await hash(refreshToken)
        const usuario:UsuarioEntity = await this.usuariosService.findOne(usuarioId)
        usuario.refreshToken = refreshTokenHashed
        await this.usuariosService.save(usuario)
    }

    async refreshToken(usuarioId:number,refreshToken:string){
        const usuario:UsuarioEntity = await this.usuariosService.findOne(usuarioId)
        if (!usuario.refreshToken) throw new ForbiddenException('Acceso denegado, el usuario no esta autenticado.')
        const refreshTokenMatch:boolean = await verify(usuario.refreshToken,refreshToken)
        if (!refreshTokenMatch) throw new ForbiddenException('El token del usuario es invalido.')
        
        const payload = {
            sub:usuario.id,
            username:usuario.username,
            rol:usuario.rol,
            profileId:usuario.perfil?.id ?? undefined
        }
        const tokens:Tokens = await this.getTokens(payload)
        await this.updateRefreshTokenHash(payload.sub,tokens.refreshToken)
        return tokens
    }

    async signIn(usuario:{sub:number,username:string,rol:Rol,profileId:number,refreshToken:string}){    
        const payload = {sub:usuario.sub,username:usuario.username,rol:usuario.rol,profileId:usuario.profileId ?? undefined}
        const tokens = await this.getTokens(payload)
        await this.updateRefreshTokenHash(payload.sub,tokens.refreshToken)
        return {
            usuarioId:payload.sub,
            username:payload.username,
            rol:payload.rol,
            profileId:payload.profileId ?? null,
            tokens
        }
        
    }
    
    async signUp(signUpDto:SignUpDto){
        const newUser = await this.usuariosService.create({...signUpDto})
        const payload = {
            sub:newUser.id,
            username:newUser.username,
            rol:newUser.rol,
            profileId:newUser.perfil?.id ?? undefined
        }
        const tokens:Tokens = await this.getTokens(payload)
        await this.updateRefreshTokenHash(payload.sub,tokens.refreshToken)
        return {
            usuarioId:payload.sub,
            username:payload.username,
            rol:payload.rol,
            profileId:payload.profileId ?? null,   
            tokens
        }
    }

    async logout(usuarioId:number,){
        const usuario:UsuarioEntity = await this.usuariosService.findOne(usuarioId)
        usuario.refreshToken = null
        await this.usuariosService.save(usuario)
    }


    async forgotPassword(email:string,url:string){
        const user = await this.usuariosService.findOneByEmail(email)
        const payload = {email:user.email}
        const token = await this.jwtService.signAsync(payload,{secret:jwtConstants.secret,expiresIn:'3m'})
        url+=`/?token=${token}`
        const response = await this.mailerService.sendMail(
            {
                to: payload.email,
                subject: 'Reset password',
                text:`Para resetear tu contraseña has click aqui:${url}`
            }
        )
        return response
      }
    
    async resetPassword(resetPasswordDto:ResetPasswordDto){
        
        try{
            const tokenIsValid:{email:string} = await this.jwtService.verifyAsync(resetPasswordDto.token,{secret:jwtConstants.secret})
            const user = await this.usuariosService.findOneByEmail(tokenIsValid.email)
            user.password = await hash(resetPasswordDto.newPassword)
            return await this.usuariosService.save(user)
        }
        catch (e){
                if (e instanceof JsonWebTokenError) throw new UnauthorizedException('Token invalido.')
            
                if (e instanceof EntityNotFoundError) throw new NotFoundException('Usuario no existe.')
                
                throw new InternalServerErrorException('Ha ocurrido un error en el servidor.')
        }

        
    }


    async validateUser(username:string, password:string):Promise<UsuarioEntity>{
        try{
            const user:UsuarioEntity = await this.usuariosService.findOneByUsername(username)
            const isMatch:boolean = await verify(user.password,password);
            if (!isMatch){
                throw new BadRequestException('La contraseña no coincide.')
            }
            return user;
        }
        catch (e){
            if (e instanceof EntityNotFoundError) throw new NotFoundException('Usuario no existe.')
            if (e instanceof BadRequestException) throw new UnauthorizedException('La contraseña no coincide.')
            throw new InternalServerErrorException()
        }
        
    }
    
}
