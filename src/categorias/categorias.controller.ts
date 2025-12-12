import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { ApiBearerAuth, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Rol } from 'src/usuarios/enum/rol.enum';
import { Public } from 'src/auth/decorators/isPublic.decorator';

@ApiBearerAuth()
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Crea una categoria (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriasService.create(createCategoriaDto);
  }

  @Get()
  @Public()
  @ApiOperation({summary:'Obtiene todas las categorias'})
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({summary:'Busca una categoria por ID.'})
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.categoriasService.findOne(+id);
  }

  @Get(':id/stock')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin,Rol.Seller])
  @ApiOperation({summary:'Obtiene el valor del stock de una categoria (Admin, Seller).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async getStockCategory(@Param('id',ParseIntPipe) id:number){
    return await this.categoriasService.getStockCategory(id)
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Actualiza una categoria (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  update(@Param('id',ParseIntPipe) id: number, @Body() updateCategoriaDto: UpdateCategoriaDto) {
    return this.categoriasService.update(+id, updateCategoriaDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Elimina una categoria (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  remove(@Param('id') id: number) {
    return this.categoriasService.remove(+id);
  }
}
