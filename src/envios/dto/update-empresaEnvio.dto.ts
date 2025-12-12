import { PartialType } from "@nestjs/swagger";
import { CreateEmpresaEnvioDto } from "./create-empresaEnvio.dto";


export class UpdateEmpresaEnvioDto extends PartialType(CreateEmpresaEnvioDto){

}