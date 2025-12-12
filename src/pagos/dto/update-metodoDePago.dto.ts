import { PartialType } from "@nestjs/swagger";
import { CreateMetodoDePagoDto } from "./create-metodoDePago.dto";

export class UpdateMetodoDePagoDto extends PartialType(CreateMetodoDePagoDto){
    
}