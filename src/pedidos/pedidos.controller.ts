import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, ParseArrayPipe, UseGuards, Req, Query } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { CreatePedidoItemDto } from './dto/create-pedido-item.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Rol } from 'src/usuarios/enum/rol.enum';
import { Public } from 'src/auth/decorators/isPublic.decorator';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(
    private readonly pedidosService: PedidosService,
  ) {}

  @Post()
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Crea un pedido (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async create(
    @Req() request:Request & {user:{sub:number,username:string,rol:Rol,profileId:number}},
    @Body() createPedidoDto: CreatePedidoDto) {
    return await this.pedidosService.create(request.user,createPedidoDto);
  }

  @Public()
  @Get()
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Obtiene todos los pedidos (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  @ApiQuery({ name: 'perfil_id', required: false, type: Number })
  async findAll(@Query('perfil_id') perfil_id?:number) {
    return await this.pedidosService.findAll(perfil_id);
  }

  @Public()
  @Get(':id')
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Busca un pedido cualquiera por ID (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async findOne(@Param('id',ParseIntPipe) id: number) {
    return await this.pedidosService.findOne(+id);
  }

  @Get('usuario/pedidos')
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Obtiene todos los pedidos de un comprador (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async findOwnPedidos(
    @Req() request:Request & {user:{sub:number,username:string,role:Rol,profileId:number}}
  ){
    return await this.pedidosService.findOwnPedidos(request.user)
  }

  @Get('usuario/pedidos/:id')
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Busca un pedido propio por ID (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async findOwnOne(
    @Req() request:Request & {user:{sub:number,username:string,role:Rol,profileId:number}},
    @Param('id',ParseIntPipe) id:number
  ){
    return await this.pedidosService.findOwnOne(request.user,id)
  }

  @Get('usuario/ventas')
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Obtiene todas las ventas de un vendedor (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async findOwnVentas(
    @Req() request:Request & {user:{sub:number,username:string,role:Rol,profileId:number}}
  ){
    return await this.pedidosService.findOwnVentas(request.user)
  }

  @Patch(':id')
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Actualiza un pedido cualquiera (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async update(@Param('id',ParseIntPipe) id: number, @Body() updatePedidoDto: UpdatePedidoDto) {
    return await this.pedidosService.update(+id, updatePedidoDto);
  }

  @Delete(':id')
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Elimina un pedido cualquiera (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async remove(@Param('id',ParseIntPipe) id: number) {
    return await this.pedidosService.remove(+id);
  }

  @Public()
  @Post(':pedidoId/items')
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiBody({type:[CreatePedidoItemDto]})
  @ApiOperation({summary:'Agrega items a un pedido cualquiera (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async addPedidoItems(@Param('pedidoId',ParseIntPipe) pedidoId:number,
  @Body(new ParseArrayPipe({items:CreatePedidoItemDto,whitelist:true})) createPedidoItemsDtos:CreatePedidoItemDto[]){
    return await this.pedidosService.addPedidoItems(pedidoId,createPedidoItemsDtos)
  }

  @Delete(':pedidoId/items')
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiBody({type:[Number]})
  @ApiOperation({summary:'Elimina items de un pedido (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async removePedidoItems(
    @Param('pedidoId',ParseIntPipe) pedidoId:number,
    @Body(new ParseArrayPipe({items:Number,whitelist:true})) itemsIds:number[]
  ){
    return await this.pedidosService.removePedidoItems(pedidoId,itemsIds)
  }
  

}
