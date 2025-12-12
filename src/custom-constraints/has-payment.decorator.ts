import { InjectRepository } from "@nestjs/typeorm";
import { ValidationArguments, ValidatorConstraint,ValidatorConstraintInterface } from "class-validator";
import { PedidoEntity } from "src/pedidos/entities/pedido.entity";
import { Repository } from "typeorm";


@ValidatorConstraint({async:true})
export class HasPaymentConstraint implements ValidatorConstraintInterface{
    constructor(
        @InjectRepository(PedidoEntity) private readonly pedidosRepository:Repository<PedidoEntity>
    ){}
    async validate(value: number, validationArguments?: ValidationArguments): Promise<boolean>{
        const pedido = await this.pedidosRepository.findOneBy({id:value})
        if (pedido?.pagos){
            return true
        }
        return false
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        return `El pedido ${validationArguments?.value} no tiene un pago asignado`
    }
}