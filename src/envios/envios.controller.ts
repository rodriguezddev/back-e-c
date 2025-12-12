import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { EnviosService } from './envios.service';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { UpdateEnvioDto } from './dto/update-envio.dto';
import { CreateEmpresaEnvioDto } from './dto/create-empresaEnvio.dto';
import { UpdateEmpresaEnvioDto } from './dto/update-empresaEnvio.dto';
import { ApiBearerAuth,ApiBody,ApiConsumes,ApiOperation,ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Rol } from 'src/usuarios/enum/rol.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorators/isPublic.decorator';
import { MetodosDeEntrega } from './enum/metodosDeEntrega.enum';

@Public()
@ApiBearerAuth()
@Controller('envios')
export class EnviosController {
  constructor(private readonly enviosService: EnviosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Crea un envio (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
      description: 'Crear un nuevo envio.',
      type: 'multipart/form-data',
      schema: {
        type:'object',
        properties: {
          cancelado: { type: 'boolean', description: 'pago cancelado', default: false, nullable: false},
          direccionEmpresa: { type: 'string', description: 'Direccion de la empresa' },
          numeroDeGuia: { type: 'string', description: 'Numero de guia' },
          empresaId: { type: 'number', description: 'ID de la empresa', nullable: true },
          pedidoId: { type: 'number', description: 'ID de la empresa', nullable: false },
          metodoDeEntrega:{
            type:'string',
            description:'Metodo de entrega',
            enum: Object.values(MetodosDeEntrega),
            example: MetodosDeEntrega.EnvioNacional, 
            nullable:true},
          image: {
            type: 'string',
            format: 'binary',
            description: 'Imagen de la guia',
          },
        },
      },
    })
  create(
    @Body() createEnvioDto: CreateEnvioDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
     let imageName: string | null = null;
    if (image) {
      imageName = image.filename
      createEnvioDto['imageName'] = imageName
    }
    
    return this.enviosService.create(createEnvioDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Obtiene todos los envios (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  findAll() {
    return this.enviosService.findAll();
  }


  @Get(':id')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Busca un envio por ID (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.enviosService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Actualiza un envio (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
      description: 'Crear un nuevo envio.',
      type: 'multipart/form-data',
      schema: {
        type:'object',
        properties: {
          direccionEmpresa: { type: 'string', description: 'Direccion de la empresa' },
          numeroDeGuia: { type: 'string', description: 'Numero de guia' },
          empresaId: { type: 'number', description: 'ID de la empresa', nullable: true },
          pedidoId: { type: 'number', description: 'ID de la empresa', nullable: false },
          metodoDeEntrega:{
            type:'string',
            description:'Metodo de entrega',
            enum: Object.values(MetodosDeEntrega),
            example: MetodosDeEntrega.EnvioNacional, 
            nullable:true},
          image: {
            type: 'string',
            format: 'binary',
            description: 'Imagen de la guia',
          },
        },
      },
    })
  update(@Param('id',ParseIntPipe) id: number, @Body() updateEnvioDto: UpdateEnvioDto, @UploadedFile() image?: Express.Multer.File) {
    let imageName: string | null = null;
    if (image) {
      imageName = image.filename
      updateEnvioDto['imageName'] = imageName
    }
    return this.enviosService.update(+id, updateEnvioDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Elimina un envio (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.enviosService.remove(+id);
  }

  @Post('empresa')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Crea una empresa de envio (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async createEmpresaEnvio(
    @Body() createEmpresaEnvioDto:CreateEmpresaEnvioDto
  ){
    return await this.enviosService.createEmpresaEnvio(createEmpresaEnvioDto)
  }

  @Get('empresa/empresas')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Obtiene todas las empresas de envios (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async findAllEmpresaEnvios(){
    return await this.enviosService.findAllEmpresaEnvios()
  }


  @Patch('empresa/:empresaId')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Actualiza una empresa de envio (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async updateEmpresaEnvio(
    @Param('empresaId',ParseIntPipe) empresaId:number,
    @Body() updateEmpresaEnvioDto:UpdateEmpresaEnvioDto,
  ){
    return await this.enviosService.updateEmpresaEnvio(empresaId,updateEmpresaEnvioDto)
  }

  @Delete('empresa/:empresaId')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Elimina una empresa de envio (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async removeEmpresaEnvio(
    @Param('empresaId',ParseIntPipe) empresaId:number
  ){
    return await this.enviosService.removeEmpresaEnvio(empresaId)
  }
}
