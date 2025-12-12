import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { HasPayment } from "src/custom-validators/HasPayment.validator";
import { IsInDatabase } from "src/custom-validators/IsInDatabase.validator";
import { PedidoEntity } from "src/pedidos/entities/pedido.entity";

export class CreateFacturaDto {
    @IsString()
    @IsOptional()
    descripcion:string

    @IsNumber()
    @HasPayment()
    @IsInDatabase(PedidoEntity,'id')
    @IsNotEmpty()
    pedidoId:number
}
