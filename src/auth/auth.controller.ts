import { Body, Controller, Post, Get, Req, UseGuards, Query, Param, Patch,} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/isPublic.decorator';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Rol } from 'src/usuarios/enum/rol.enum';
import { PerfilEntity } from 'src/usuarios/entities/perfil.entity';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { SignUpDto } from './dto/signUp.dto';
import { SignInDto } from './dto/singIn.dto';
import { ForgetPasswordDto } from './dto/forgetPassword.dto';


@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('refresh')
  @Public()
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({summary:'Refrescar token.'})
  async refreshToken(@Req() req:Request & {user:{sub:number,username:string,rol:Rol,profileId:number,refreshToken:string}}){
    return await this.authService.refreshToken(req.user.sub,req.user.refreshToken)
  }
  
  @Post('iniciar-sesion')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiOperation({summary:'Iniciar sesion.'})
  signIn(
    @Body() signInDto:SignInDto,
    @Req() req:Request & {user:{sub:number,username:string,rol:Rol,profileId:number,refreshToken:string}},
  ){
    return this.authService.signIn(req.user)
  }

  @Post('registrarse')
  @Public()
  @ApiOperation({summary:'Registrar usuario.'})
  async signUp(
    @Body() signUpDto:SignUpDto,
  ){
    return await this.authService.signUp(signUpDto)

  }

  @Post('forgot-password')
  @Public()
  @ApiOperation({summary:'Recuperar contraseña.'})
  async forgotPassword(
    @Req() request:Request,
    @Body() forgetPasswordDto:ForgetPasswordDto
  ){
    let host = process.env.NODE_ENV === 'develop' ? 'http://localhost:8080' : 'https://repuestos-accesorios.netlify.app'
    let url = host + '/auth/' +'reset-password'
    const response = await this.authService.forgotPassword(forgetPasswordDto.email,url)
    
    return response
  }

  @Patch('reset-password/')
  @Public()
  @ApiOperation({summary:'Resetear contraseña.'})
  async resetPassword(
    @Body() resetPasswordDto:ResetPasswordDto
  ){
    return await this.authService.resetPassword(resetPasswordDto)
  }


  @Post('logout')
  @ApiOperation({summary:'Salir de la sesion.'})
  async logout(
    @Req() req:Request & {user:{sub:number,username:string,rol:Rol,profileId:number,refreshToken:string}}
  ){
    return await this.authService.logout(req.user.sub)
  }

  @Get()
  @ApiOperation({summary:'Ver perfil.'})
  getProfile(@Req() req){
    return req.user
  }
}
