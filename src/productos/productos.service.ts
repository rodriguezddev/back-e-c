import { Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoEntity } from './entities/producto.entity';
import { Equal, In, MoreThan, Repository } from 'typeorm';
import { CategoriasService } from 'src/categorias/categorias.service';
import { CategoriaEntity } from 'src/categorias/entities/categoria.entity';
import { UpdateDescuentos } from './dto/update-descuentos.dto';

@Injectable()
export class ProductosService {

  constructor(
    @InjectRepository(ProductoEntity) private readonly productoRepository:Repository<ProductoEntity>,
    private readonly categoriaService:CategoriasService
  ){}

  async getZeroExistenceProducts(){
    return await this.productoRepository.find(
      {
        where:{
          stock:Equal(0)
        },
        select:{
          id:true,
          nombre:true,
          codigo:true
        }
      }
    )
  }


  async create(createProductoDto: CreateProductoDto & {imageName?:string}) {
    const categoria:CategoriaEntity|undefined = createProductoDto.categoriaId ? await this.categoriaService.findOne(createProductoDto.categoriaId): undefined
    const producto = this.productoRepository.create(
      {
        ...createProductoDto,
        image:createProductoDto?.imageName,
        categoria:categoria
      }
    )
    return await this.productoRepository.save(producto)
  }

  async findAll() {
    const productos = await this.productoRepository.find({relations:{categoria:true}})
    productos.map((producto) => producto['precioConDescuento'] = producto.aplicarPrecioConDescuento())
    return productos
  }

  async findAllWithStock(){
    const productos = await this.productoRepository.find(
      {
        where:{stock:MoreThan(0)},
        relations:{categoria:true}
      }
    )
    productos.map((producto) => producto['precioConDescuento'] = producto.aplicarPrecioConDescuento())
    return productos
  }

  async findOne(id: number) {
    const producto = await this.productoRepository.findOneOrFail(
      {
        where:{
          id:id
        },
        relations:{
          categoria:true
        }
      }
    )
    return producto
  }

  async updateDiscountMany(updateDescuentos:UpdateDescuentos){
    const ids = updateDescuentos.productosId
    const descuento = updateDescuentos.descuento
    const products = await this.productoRepository.find(
      {
        where:{
          id:In(ids)
        },
        
        relations:{
          categoria:true
        }
      }
    )
    products.map((product) => product.descuento = descuento)
    return await this.productoRepository.save(products)
  }

  async update(id: number, updateProductoDto: UpdateProductoDto & {imageName?:string}) {
    const categoria:CategoriaEntity|undefined = updateProductoDto.categoriaId ? await this.categoriaService.findOne(updateProductoDto.categoriaId): undefined
    const producto = await this.findOne(id)
    Object.assign(producto,updateProductoDto)
    if (categoria){
      producto.categoria = categoria
    }
    if (updateProductoDto?.imageName){
      producto.image = updateProductoDto?.imageName
    }
    producto['precioConDescuento'] = producto.aplicarPrecioConDescuento()
    return await this.productoRepository.save(producto)
    
  }

  async remove(id: number) {
    const producto = await this.findOne(id)
    return await this.productoRepository.remove(producto)
  }
}
