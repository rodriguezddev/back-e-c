import { OmitType } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import { CreateUsuarioDto } from "src/usuarios/dto/create-usuario.dto";


export class SignUpDto extends OmitType(CreateUsuarioDto,['perfil','rol']) {

}