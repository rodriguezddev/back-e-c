import { IsString, IsOptional, IsNumberString, MinLength, MaxLength, IsNumber, } from "class-validator";
import { IsVePhoneNumber } from "../validators/numero-telefono.validator";
import { IsInDatabase } from "../../custom-validators/IsInDatabase.validator";
import { UsuarioEntity } from "../entities/usuario.entity";
import { ApiProperty } from "@nestjs/swagger";
import { UniqueInDatabase } from "src/custom-validators/UniqueInDatabase.validator";
import { PerfilEntity } from "../entities/perfil.entity";

export class CreatePerfilDto{

    @IsString()
    nombre:string

    @IsString()
    apellido:string
 
    @IsString()
    @IsOptional()
    direccion?:string
    
    @ApiProperty(
        {
            example:"30123123",
            minimum:7,
            maximum:9
        }
    )
    @IsNumberString()
    @MinLength(7)
    @MaxLength(9)
    @UniqueInDatabase(PerfilEntity,'cedula')
    cedula:string


    @ApiProperty(
        {
            example:"0412-1234567",
            pattern:"^04(12|24|14|16|26)-[0-9]{7}$"
        }
    )
    @IsVePhoneNumber({message:'numeroTelefono debe cumplir el formato 04(12|16|26|14|24)-XXXXXXX'})
    @UniqueInDatabase(PerfilEntity,'numeroTelefono')
    numeroTelefono:string 

    @ApiProperty({
        description:'Solo para asignar un perfil a un usuario'
    })
    @IsNumber()
    @IsInDatabase(UsuarioEntity,'id')
    @IsOptional()
    usuarioId?:number

}