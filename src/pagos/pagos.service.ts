import { ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PagoEntity } from "./entities/pago.entity";
import { Repository } from "typeorm";
import { PedidosService } from "../pedidos/pedidos.service";
import { CreatePagoDto } from "./dto/create-pago.dto";
import { UpdatePagoDto } from "./dto/update-pago.dto";
import { MetodosDePagoService } from "./metodosDePago.service";


@Injectable()
export class PagosService{
    
    constructor(
        @InjectRepository(PagoEntity) private readonly pagosRepository:Repository<PagoEntity>,
        private readonly pedidosService:PedidosService,
        private readonly metodoDePagoService:MetodosDePagoService,
    ){}

    /**
     * Crea un pago y lo asigna a un pedido
     * @param pedidoId 
     * @param createPagoDto 
     * @returns 
     */
    async create(pedidoId: number, createPagoDto: CreatePagoDto & { imageName?: string }) {
        const pedido = await this.pedidosService.findOne(pedidoId);
        const metodoDePago = await this.metodoDePagoService.findOne(createPagoDto.metodoDePagoId);
        
        const pago = this.pagosRepository.create({
            numeroReferencia: createPagoDto.numeroReferencia,
            monto: createPagoDto.monto,
            nombreFormaDePago: createPagoDto.nombreFormaDePago,
            image: createPagoDto.imageName, // Asigna el nombre de la imagen al campo
        });

        // Obtener la tasa del bcv
        const response_json = await (await fetch('https://ve.dolarapi.com/v1/dolares/oficial', { method: 'GET' })).json();
        const tasaBsDelDia = response_json.promedio;
        pago.pedido = pedido;
        pago.tasaBsDelDia = tasaBsDelDia;
        pago.metodoDePago = metodoDePago;
        return await this.pagosRepository.save(pago);
    }
    /**
     * Obtiene todos los pagos
     * @returns 
     */
    async findAll(){
        return await this.pagosRepository.find({
            select:{nombreFormaDePago:true, monto:true, tasaBsDelDia:true, numeroReferencia:true, fecha:true,pedido:{id:true}},
            relations:{pedido:true}})
    }

    /**
     * Obtiene un pago por id
     * @param id 
     * @returns 
     */
    async findOne(id:number){
        return await this.pagosRepository.findOneByOrFail({id:id})
        
    }

    /**
     * Actualiza los datos de un pago
     * @param pedidoId 
     * @param updatePagoDto 
     * @returns 
     */
    async update(id: number, updatePagoDto: UpdatePagoDto & { imageName?: string }) {
        const pago = await this.pagosRepository.findOneByOrFail({ id: id });
        Object.assign(pago, updatePagoDto);
        if (updatePagoDto.metodoDePagoId) {
            const metodoDePago = await this.metodoDePagoService.findOne(updatePagoDto.metodoDePagoId);
            pago.metodoDePago = metodoDePago;
        }
        if (updatePagoDto.imageName) {
            pago.image = updatePagoDto.imageName; // Asigna el nuevo nombre de la imagen
        }
        return await this.pagosRepository.save(pago);
    }

    /**
     * Elimina un pago
     * @param id 
     * @returns 
     */
    async remove(id:number){
        const pago = await this.pagosRepository.findOneByOrFail({id:id})//manejar error
        return await this.pagosRepository.remove(pago)
    }
        
}