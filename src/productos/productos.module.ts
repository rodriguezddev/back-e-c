import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoEntity } from './entities/producto.entity';
import { IsInDatabaseConstraint } from 'src/custom-constraints/is-in-database.validator';
import { CategoriasModule } from 'src/categorias/categorias.module';
import { UniqueInDatabaseConstraint } from 'src/custom-constraints/unique-in-database.decorator';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

@Module({
  imports:[CategoriasModule,MulterModule.register(multerConfig),TypeOrmModule.forFeature([ProductoEntity])],
  controllers: [ProductosController],
  providers: [ProductosService,IsInDatabaseConstraint,UniqueInDatabaseConstraint],
  exports:[ProductosService]
})
export class ProductosModule {}
