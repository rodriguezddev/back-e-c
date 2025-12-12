import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { IsInDatabaseConstraint } from 'src/custom-constraints/is-in-database.validator';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoEntity } from './entities/pedido.entity';
import { PedidoItemEntity } from './entities/pedidoItem.entity';
import { ProductosModule } from 'src/productos/productos.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { PedidoItemService } from './pedidoItem.service';
import { IsNotDuplicatedNumberConstraint } from 'src/custom-constraints/is-not-duplicated-number.decorator';
import { ProductosService } from 'src/productos/productos.service';


@Module({
  imports:[
    ProductosModule,
    UsuariosModule,
    TypeOrmModule.forFeature([PedidoEntity,PedidoItemEntity])
  ],
  controllers: [PedidosController],
  providers: [
    PedidosService,
    PedidoItemService,
    IsInDatabaseConstraint,
    IsNotDuplicatedNumberConstraint
  ],
  exports:[PedidosService]
})
export class PedidosModule {}
