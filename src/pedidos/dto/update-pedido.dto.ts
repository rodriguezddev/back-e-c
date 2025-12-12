import { PartialType } from '@nestjs/swagger';
import { OmitType } from '@nestjs/swagger';
import { CreatePedidoDto } from './create-pedido.dto';
import { UpdatePedidoItemDto } from './update-pedido-item.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePedidoDto extends PartialType(OmitType(CreatePedidoDto,['perfilId','items'] as const)) {

    @ValidateNested()
    @Type(() => UpdatePedidoItemDto)
    items?: UpdatePedidoItemDto[]  |undefined;
}
