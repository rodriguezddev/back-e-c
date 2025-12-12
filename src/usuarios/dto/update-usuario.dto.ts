import { PartialType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';
import { OmitType } from '@nestjs/swagger';


export class UpdateUsuarioDto extends PartialType(OmitType(CreateUsuarioDto,['password','perfil'] as const)) {}
