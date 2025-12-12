import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { UpdateDescuentos } from './dto/update-descuentos.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation,ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/isPublic.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Rol } from 'src/usuarios/enum/rol.enum';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @Public()
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  @AllowRoles([Rol.Admin])
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Crear un nuevo producto.',
    type: 'multipart/form-data',
    schema: {
      type:'object',
      properties: {
        nombre: { type: 'string', description: 'Nombre del producto' },
        descripcion: { type: 'string', description: 'Descripción del producto', nullable: true },
        disponible: { type: 'boolean', description: 'Disponibilidad del producto', default: false },
        descuento: { type: 'number', format: 'float', description: 'Descuento del producto', minimum: 0, maximum: 100, nullable: true },
        precio: { type: 'number', format: 'float', description: 'Precio del producto', minimum: 0 },
        aplicarDescuentoCategoria: { type: 'boolean', description: 'Aplicar descuento de categoría', default: false, nullable: false},
        stock: { type: 'number', description: 'Stock del producto', nullable: true },
        categoriaId: { type: 'number', description: 'ID de la categoría', nullable: true },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagen del producto',
        },
      },
      required: ['nombre', 'precio'], 
    },
  })
  @ApiOperation({summary:'Crea un producto (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async create(
    @Body() createProductoDto: CreateProductoDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    let imageName: string | null = null;
    if (image) {
      imageName = image.filename
      createProductoDto['imageName'] = imageName
    }
    console.log(createProductoDto)
    return await this.productosService.create(createProductoDto);
  }

  @Get()
  @Public()
  @ApiOperation({summary:'Obtiene todos lo productos.'})
  findAll() {
    return this.productosService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({summary:'Busca un producto por ID.'})
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.productosService.findOne(+id);
  }

  @Public()
  @Patch(':id')
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  @AllowRoles([Rol.Admin])
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Actualizar producto con imagen',
    type: 'multipart/form-data',
    schema: {
      type:'object',
      properties: {
        nombre: { type: 'string', description: 'Nombre del producto',nullable:true},
        descripcion: { type: 'string', description: 'Descripción del producto', nullable: true },
        disponible: { type: 'boolean', description: 'Disponibilidad del producto', default: false },
        descuento: { type: 'number', format: 'float', description: 'Descuento del producto', minimum: 0, maximum: 100, nullable: true },
        precio: { type: 'number', format: 'float', description: 'Precio del producto', minimum: 0 ,nullable:true},
        aplicarDescuentoCategoria: { type:'boolean', description: 'Aplicar descuento de categoría', default: false, nullable: true },
        stock: { type: 'number', description: 'Stock del producto', nullable: true },
        categoriaId: { type: 'number', description: 'ID de la categoría', nullable: true },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagen del producto',
        },
      }, 
    },
  })
  @ApiOperation({summary:'Actualiza un producto (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  update(
    @Param('id',ParseIntPipe) id: number, 
    @Body() updateProductoDto: UpdateProductoDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    let imageName: string | null = null;
    if (image) {
      imageName = image.filename
      updateProductoDto['imageName'] = imageName
    }
    return this.productosService.update(+id, updateProductoDto);
  }

  @Patch('aplicar/descuentos')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Actualiza el descuento de muchos productos (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  async updateDiscountMany(@Body() updateDescuentos:UpdateDescuentos){
    return await this.productosService.updateDiscountMany(updateDescuentos)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Elimina un producto (Admin).'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.productosService.remove(+id);
  }
}
