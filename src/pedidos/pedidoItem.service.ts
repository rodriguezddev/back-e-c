import { Injectable } from "@nestjs/common";
import { In, Repository } from "typeorm";
import { PedidoItemEntity } from "./entities/pedidoItem.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductosService } from "src/productos/productos.service";
import { CreatePedidoItemDto } from "./dto/create-pedido-item.dto";
import { UpdatePedidoItemDto } from "./dto/update-pedido-item.dto";
import { ProductoEntity } from "src/productos/entities/producto.entity";

@Injectable()
export class PedidoItemService{

    constructor(
        @InjectRepository(PedidoItemEntity) private readonly pedidoItemRepository:Repository<PedidoItemEntity>,
        private readonly productosService:ProductosService,
    ){}

    async save(pedidoItemEntity:PedidoItemEntity){
        return await this.pedidoItemRepository.save(pedidoItemEntity)
    }

    async create(createPedidoItemDto:CreatePedidoItemDto){
        const producto:ProductoEntity = await this.productosService.findOne(createPedidoItemDto.productoId)
        const pedidoItem:PedidoItemEntity = new PedidoItemEntity()
        pedidoItem.cantidad = createPedidoItemDto.cantidad ?? 1
        pedidoItem.producto = producto
        return pedidoItem
    }

    async findOne(id:number){
        const pedidoItem:PedidoItemEntity = await this.pedidoItemRepository.findOneByOrFail({id:id})
        return pedidoItem
    }

    async update(id:number,updatePedidoItemDto:UpdatePedidoItemDto){
        const pedidoItem:PedidoItemEntity = await this.findOne(id)
        
        pedidoItem.cantidad = updatePedidoItemDto.cantidad ?? pedidoItem.cantidad
        return await this.pedidoItemRepository.save(pedidoItem)
        
    }

    async remove(id:number){
        const pedidoItem:PedidoItemEntity = await this.findOne(id)
        return await this.pedidoItemRepository.remove(pedidoItem)
    }
}