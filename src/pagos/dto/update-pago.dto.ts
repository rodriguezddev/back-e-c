import { PartialType } from "@nestjs/swagger";
import { CreatePagoDto } from "../../pagos/dto/create-pago.dto";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";


export class UpdatePagoDto extends PartialType(CreatePagoDto){
    
    @IsNumber({maxDecimalPlaces:2})
    @IsOptional()
    @Type(() => Number)
    tasaBsDelDia:number
}