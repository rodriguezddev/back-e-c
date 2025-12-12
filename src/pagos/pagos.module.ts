import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagoEntity } from './entities/pago.entity';
import { PedidosModule } from 'src/pedidos/pedidos.module';
import { MetodosDePagoService } from './metodosDePago.service';
import { MetodoDePagoEntity } from './entities/metodosDePago.entity';
import { IsInDatabaseConstraint } from 'src/custom-constraints/is-in-database.validator';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

@Module({
  imports:[PedidosModule,MulterModule.register(multerConfig),TypeOrmModule.forFeature([PagoEntity, MetodoDePagoEntity])],
  controllers: [PagosController],
  providers: [PagosService, MetodosDePagoService, IsInDatabaseConstraint,],
})
export class PagosModule {}
