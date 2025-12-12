import { ArrayNotEmpty,IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { TipoDePedido } from "../enum/tipoDePedido.enum";
import { IsInDatabase } from "src/custom-validators/IsInDatabase.validator";
import { PerfilEntity } from "src/usuarios/entities/perfil.entity";
import { Type } from "class-transformer";
import { CreatePedidoItemDto } from "./create-pedido-item.dto";
import { IsNotDuplicatedNumber } from "src/custom-validators/IsNotDuplicatedNumber.validator";
import { EstadoDePedido } from "../enum/estadosPedido.enum";
import { IsNull } from "typeorm";

export class CreatePedidoDto {

    @IsEnum(TipoDePedido)
    @IsNotEmpty()
    tipoDePedido:TipoDePedido

    @IsBoolean()
    @IsOptional()
    pagado:boolean

    @IsBoolean()
    @IsOptional()
    cancelado:boolean
    
    @IsEnum(EstadoDePedido)
    @IsOptional()
    estado:EstadoDePedido

    @IsNumber()
    @IsInDatabase(PerfilEntity,'id')
    @IsOptional()
    perfilId?:number

    @IsNotEmpty()
    @ArrayNotEmpty()
    @IsNotDuplicatedNumber()
    @ValidateNested({each:true})
    @Type(() => CreatePedidoItemDto)
    items:CreatePedidoItemDto[]
}
