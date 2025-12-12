import { PartialType,OmitType } from '@nestjs/swagger';
import { CreateEnvioDto } from './create-envio.dto';

export class UpdateEnvioDto extends PartialType(OmitType(CreateEnvioDto,['pedidoId'] as const)) {}
