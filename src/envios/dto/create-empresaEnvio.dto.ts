import { IsNotEmpty, IsString } from "class-validator";


export class CreateEmpresaEnvioDto{

    @IsString()
    @IsNotEmpty()
    nombre:string
}