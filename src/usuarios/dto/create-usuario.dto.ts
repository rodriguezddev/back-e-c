import { IsEmail,IsString,IsStrongPassword,IsNotEmpty,IsOptional, IsEnum, ValidateNested } from "class-validator";
import { Rol } from "../enum/rol.enum";
import { Type } from "class-transformer";
import { CreatePerfilDto } from "./create-perfil.dto";
import { ApiProperty } from "@nestjs/swagger";
import { UniqueInDatabase } from "src/custom-validators/UniqueInDatabase.validator";
import { UsuarioEntity } from "../entities/usuario.entity";


export class CreateUsuarioDto {

    @IsString()
    @IsNotEmpty()
    @UniqueInDatabase(UsuarioEntity,'username')
    username:string


    @IsEmail()
    @IsNotEmpty()
    @UniqueInDatabase(UsuarioEntity,'email')
    email:string


    @IsEnum(Rol)
    @IsOptional()
    rol?:Rol


    @ApiProperty(
        {
            example:"Pepos234.a",
        }
    )
    @IsStrongPassword({minSymbols:1})
    @IsNotEmpty()
    password:string


    @ValidateNested()
    @Type(() => CreatePerfilDto)
    @IsOptional()
    perfil?:CreatePerfilDto
}
