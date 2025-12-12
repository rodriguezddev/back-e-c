import { PartialType } from "@nestjs/swagger";
import { OmitType } from "@nestjs/swagger";
import { CreatePedidoItemDto } from "./create-pedido-item.dto";
import { IsNotEmpty, IsNumber } from "class-validator";
import { IsInDatabase } from "src/custom-validators/IsInDatabase.validator";
import { PedidoItemEntity } from "../entities/pedidoItem.entity";

export class UpdatePedidoItemDto extends PartialType(OmitType(CreatePedidoItemDto,['productoId'] as const)){

    @IsNumber()
    @IsInDatabase(PedidoItemEntity,'id')
    @IsNotEmpty()
    pedidoItemId:number
}