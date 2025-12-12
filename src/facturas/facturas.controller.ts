import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { ApiBearerAuth, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Rol } from 'src/usuarios/enum/rol.enum';
import { Public } from 'src/auth/decorators/isPublic.decorator';

@Public()
@ApiBearerAuth()
@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  
  @Post()
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Crea una factura (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  create(
    @Body() createFacturaDto: CreateFacturaDto
  ) {
    return this.facturasService.create(createFacturaDto);
  }

  @Get()
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Obtiene todas las facturas (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  findAll() {
    return this.facturasService.findAll();
  }

  @Get(':id')
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Busca una factura por ID (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.facturasService.findOne(+id);
  }

  @Patch(':id')
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Actualiza una factura (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  update(@Param('id',ParseIntPipe) id: number, @Body() updateFacturaDto: UpdateFacturaDto) {
    return this.facturasService.update(+id, updateFacturaDto);
  }

  @Delete(':id')
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Elimina una factura (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.facturasService.remove(+id);
  }
}
