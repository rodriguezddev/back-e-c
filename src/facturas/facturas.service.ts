import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FacturaEntity } from "./entities/factura.entity";
import { Repository } from "typeorm";
import { CreateFacturaDto } from "./dto/create-factura.dto";
import { PedidosService } from "src/pedidos/pedidos.service";
import { UpdateFacturaDto } from "./dto/update-factura.dto";
import { instanceToPlain } from "class-transformer";


@Injectable()
export class FacturasService{
    constructor(
        @InjectRepository(FacturaEntity) private readonly facturaRepository:Repository<FacturaEntity>,
        private readonly pedidosService:PedidosService,
    ){}

async create(createFacturaDto: CreateFacturaDto) {
  const pedido = await this.pedidosService.findOne(createFacturaDto.pedidoId);
  if (!pedido) {
    throw new NotFoundException(`Pedido con ID ${createFacturaDto.pedidoId} no encontrado.`);
  }

  if (!pedido.pagos || pedido.pagos.length === 0) {
    throw new ConflictException(`El pedido de ID ${pedido.id} no tiene un pago para ser facturado.`);
  }

  // **Check if a factura for this pedidoId already exists**
  const existingFactura = await this.facturaRepository.findOne({ where: { pedido: { id: pedido.id } } });
  if (existingFactura) {
    throw new ConflictException(`El pedido de ID ${pedido.id} ya tiene una factura asociada (ID: ${existingFactura.id}).`);
  }

  const factura = this.facturaRepository.create({ descripcion: createFacturaDto.descripcion });

  factura.pagos = pedido.pagos.map(pago => {
    pago.factura = factura;
    return pago;
  });

  factura.pedido = pedido;
  const savedFactura = await this.facturaRepository.save(factura);

  return instanceToPlain(savedFactura);
}

    async findAll(){
        return await this.facturaRepository.find({})
    }

    async findOne(id:number){
        return await this.facturaRepository.findOneByOrFail({id:id})
    }

    async update(id:number,updateFacturaDto:UpdateFacturaDto){
        const factura = await this.findOne(id)
        Object.assign(factura,updateFacturaDto)
        return await this.facturaRepository.save(factura)
    }

    async remove(id:number){
        const factura = await this.findOne(id)
        return await this.facturaRepository.remove(factura)
    }
}