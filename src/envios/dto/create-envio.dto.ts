import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { MetodosDeEntrega } from "../enum/metodosDeEntrega.enum";
import { IsInDatabase } from "src/custom-validators/IsInDatabase.validator";
import { EmpresaEnvioEntity } from "../entities/empresaEnvio.entity";
import { PedidoEntity } from "src/pedidos/entities/pedido.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";


export class CreateEnvioDto {

    @IsString()
    @IsOptional()
    direccionEmpresa:string
    
    @IsBoolean()
    @IsOptional()
    cancelado:boolean

    @IsString()
    @IsOptional()
    destinatarioNombre:string

    @IsString()
    @IsOptional()
    destinatarioApellido:string

    @IsString()
    @IsOptional()
    destinatarioCedula:string

    @IsString()
    @IsOptional()
    destinatarioTelefono:string

    @IsString()
    @IsOptional()
    numeroDeGuia:string

    @IsEnum(MetodosDeEntrega)
    @IsNotEmpty()
    metodoDeEntrega:MetodosDeEntrega

    @ApiProperty({
        type:'number'
    })
    @IsNumber()
    @IsInDatabase(EmpresaEnvioEntity,'id')
    @IsOptional()
    @Type(() => Number)
    empresaId:number|undefined

    @ApiProperty({
        type:'number'
    })
    @IsNumber()
    @IsInDatabase(PedidoEntity,'id')
    @IsNotEmpty()
    @Type(() => Number)
    pedidoId:number
}
