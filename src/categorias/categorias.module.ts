import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaEntity } from './entities/categoria.entity';
import { UniqueInDatabaseConstraint } from 'src/custom-constraints/unique-in-database.decorator';

@Module({
  imports:[TypeOrmModule.forFeature([CategoriaEntity])],
  controllers: [CategoriasController],
  providers: [CategoriasService,UniqueInDatabaseConstraint],
  exports:[CategoriasService]
})
export class CategoriasModule {}
