import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { ApiBearerAuth, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Rol } from './enum/rol.enum';
import { Public } from 'src/auth/decorators/isPublic.decorator';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Public()
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Crea un usuario (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @Public()
  @ApiOperation({summary:'Obtiene todos los usuarios (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async findAll() {
    return await this.usuariosService.findAll();
  }


  @Get(':id')
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Busca un usuario por ID (Admin).'})
  //@ApiResponse()
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async findOne(@Param('id',ParseIntPipe) id: number) {
    return await this.usuariosService.findOne(+id);
  }

  @Public()
  @Patch(':id')
  @AllowRoles([Rol.Admin, Rol.User, Rol.Seller])
  @ApiOperation({summary:'Actualiza un usuario de rol vendedor (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async update(@Param('id',ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return await this.usuariosService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Elimina un usuario (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async remove(@Param('id',ParseIntPipe) id: number) {
    return await this.usuariosService.remove(+id);
  }

  @Post('perfiles')
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Crea un perfil (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async createPerfil(@Body() createPerfilDto:CreatePerfilDto){
    return await this.usuariosService.createPerfil(createPerfilDto)
  }

  @Get('perfiles/perfiles')
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Obtiene todos los perfiles (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async findAllPerfiles(){
    return await this.usuariosService.findAllPerfiles()
  }

  
  @Get('perfiles/:id')
  @AllowRoles([Rol.Admin,Rol.Seller, Rol.User])
  @ApiOperation({summary:'Busca un perfil por ID (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async findOnePerfil(@Param('id',ParseIntPipe) id:number){
    return await this.usuariosService.findOnePerfil(+id)
  }


  
  @Patch('perfiles/:id')
  @AllowRoles([Rol.Admin,Rol.Seller, Rol.User])
  @ApiBody({type:UpdatePerfilDto})
  @ApiOperation({summary:'Actualiza un perfil (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async updatePerfil(@Param('id',ParseIntPipe) id:number,@Body() updatePerfilDto:UpdatePerfilDto){
    return await this.usuariosService.updatePerfil(+id,updatePerfilDto)
  }

  @Patch('perfiles/perfil/mi-perfil')
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiBody({type:UpdatePerfilDto})
  @ApiOperation({summary:'Actualiza un perfil propio (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async updateOwnPerfil(
    @Req() request:Request & {user:{sub:number,username:string,role:Rol,profileId:number}},
    @Body() updatePerfilDto:UpdatePerfilDto,
  ){
    return await this.usuariosService.updateOwnPerfil(request.user,updatePerfilDto)
  }

  @Delete('perfiles/:id')
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Elimina un perfil (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async removePerfil(@Param('id',ParseIntPipe) id:number){
    return await this.usuariosService.removePerfil(+id)
  }

}
