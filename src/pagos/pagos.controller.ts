import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Rol } from 'src/usuarios/enum/rol.enum';
import { Public } from 'src/auth/decorators/isPublic.decorator';
import { MetodosDePagoService } from './metodosDePago.service';
import { CreateMetodoDePagoDto } from './dto/create-metodoDePago.dto';
import { UpdateMetodoDePagoDto } from './dto/update-metodoDePago.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Public()
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('pagos')
export class PagosController {
  constructor(
    private readonly pagosService: PagosService,
    private readonly metodosDePagoService:MetodosDePagoService,
  ) {}

  @Post('pedido/:pedidoId')
  @AllowRoles([Rol.Admin, Rol.Seller, Rol.User])
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        // ... otras propiedades del DTO de pago
        numeroReferencia: { type: 'string' },
        monto: { type: 'number', format: 'float' },
        nombreFormaDePago: { type: 'string', enum: ['PAGOMOVIL', 'ZELLE', 'TRANSFERENCIA', 'EFECTIVO','EFECTIVOBS'] },
        metodoDePagoId: { type: 'number', nullable: true },
        image: { type: 'string', format: 'binary' },
        cancelado: { type: 'boolean', description: 'pago cancelado', default: false, nullable: false},
      },
    },
  })
  @ApiOperation({ summary: 'Crea un pago de un pedido (Admin, Seller, User).' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(
    @Param('pedidoId') pedidoId: number,
    @Body() createPagoDto: CreatePagoDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const imageName: string | undefined = image ? image.filename : undefined;
    return this.pagosService.create(pedidoId, { ...createPagoDto, imageName });
  }

  @Get()
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Obtiene todos los pagos (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  findAll() {
    return this.pagosService.findAll();
  }

  @Get(':id')
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Busca un pago (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.pagosService.findOne(+id);
  }

  @Patch(':id')
  @AllowRoles([Rol.Admin, Rol.Seller, Rol.User])
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        // ... propiedades del DTO de actualización
        numeroReferencia: { type: 'string', nullable: true },
        monto: { type: 'number', format: 'float', nullable: true },
        nombreFormaDePago: { type: 'string', enum: ['PAGOMOVIL', 'ZELLE', 'TRANSFERENCIA', 'EFECTIVO','EFECTIVOBS'], nullable: true },
        metodoDePagoId: { type: 'number', nullable: true },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Actualiza un pago (Admin, Seller, User).' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePagoDto: UpdatePagoDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const imageName: string | undefined = image ? image.filename : undefined;
    return this.pagosService.update(id, { ...updatePagoDto, imageName });
  }


  @Delete(':id')
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Elimina un pago (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async remove(@Param('id',ParseIntPipe) id: number) {
    return await this.pagosService.remove(id)
  }

 
  @Post('metodo-de-pago/')
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Crea un metodo de pago (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async createMetodoDePago(
    @Body() createPagoDto: CreateMetodoDePagoDto
  ) {
    return await this.metodosDePagoService.create(createPagoDto)
  }

  @Get('metodo-de-pago/metodos-de-pago')
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Obtinene todos los metodo de pago (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async findAllMetodoDePago() {
    return await this.metodosDePagoService.findAll()
  }


  @Delete('metodo-de-pago/:id')
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Elimina un metodo de pago (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async removeMetodoDepago(@Param('id',ParseIntPipe) id: number) {
    return await this.metodosDePagoService.remove(id)
  }

  @Patch('metodo-de-pago/:id')
  @AllowRoles([Rol.Admin,Rol.Seller,Rol.User])
  @ApiOperation({summary:'Actualiza un metodo de pago (Admin, Seller, User).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  updateMetodo(
    @Param('id') id:number,
    @Body() updateMetodoDePagoDto: UpdateMetodoDePagoDto
  ) {
    return this.metodosDePagoService.update(id,updateMetodoDePagoDto);
  }
}
