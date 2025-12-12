import { Injectable } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Repository } from 'typeorm';
import { CategoriaEntity } from './entities/categoria.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoriasService {

  constructor(
    @InjectRepository(CategoriaEntity) private readonly CatergoriaRepository:Repository<CategoriaEntity>
  ){}

  async create(createCategoriaDto: CreateCategoriaDto) {
    const categoria = this.CatergoriaRepository.create({...createCategoriaDto})
    return await this.CatergoriaRepository.save(categoria)
  }
  //REVISAR
  async getStockCategory(id:number){
  
    const categoria:CategoriaEntity|null|undefined = await this.CatergoriaRepository.createQueryBuilder('categoria').
    select(['categoria.id','categoria.nombre']).
    where('categoria.id = :id',{id:id}).
    leftJoin('categoria.productos','productos').
    addSelect('SUM(productos.stock)','StockTotal').
    addSelect('ROUND(SUM(productos.stock * ((productos.precio - (productos.descuento * productos.precio)/100)*categoria.descuento /100)),2)','ValorStockConDescuentoProductoCategoria').
    addSelect('ROUND(SUM(productos.stock * (productos.precio - ((productos.descuento * productos.precio)/100))),2)','ValorStockDescuentoProducto').
    groupBy('categoria.id').
    addSelect('SUM(productos.stock * productos.precio)','ValorStockTotal').
    getRawOne()

    return categoria
  }

  async findAll() {
    return await this.CatergoriaRepository.find(
      {
        relations:{
          productos:true
        }
      }
    )
  }

  async findOne(id: number) {
    return await this.CatergoriaRepository.findOneOrFail(
      {
        where:{
          id:id
        },
        select:{
          productos:true
        },
        relations:{
          productos:true
        }
        
      }
    )
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    return await this.CatergoriaRepository.update({id:id},{...updateCategoriaDto})
  }

  async remove(id: number) {
    const categoria = await this.findOne(id)
    return await this.CatergoriaRepository.remove(categoria)
  }
}
