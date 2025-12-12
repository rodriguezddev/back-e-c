import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { PedidosModule } from 'src/pedidos/pedidos.module';
import { ProductosModule } from 'src/productos/productos.module';

@Module({
  imports:[ProductosModule,PedidosModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
