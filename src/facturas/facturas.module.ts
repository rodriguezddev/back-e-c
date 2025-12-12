import { Module } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { FacturasController } from './facturas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaEntity } from './entities/factura.entity';
import { PedidosModule } from 'src/pedidos/pedidos.module';
import { IsInDatabaseConstraint } from 'src/custom-constraints/is-in-database.validator';
import { HasPaymentConstraint } from 'src/custom-constraints/has-payment.decorator';
import { PedidoEntity } from 'src/pedidos/entities/pedido.entity';

@Module({
  imports:[PedidosModule,TypeOrmModule.forFeature([FacturaEntity,PedidoEntity])],
  controllers: [FacturasController],
  providers: [FacturasService,IsInDatabaseConstraint,HasPaymentConstraint],
})
export class FacturasModule {}
