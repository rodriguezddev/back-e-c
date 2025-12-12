import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioEntity } from './entities/usuario.entity';
import { PerfilEntity } from './entities/perfil.entity';
import { IsInDatabaseConstraint } from 'src/custom-constraints/is-in-database.validator';
import { UniqueInDatabaseConstraint } from 'src/custom-constraints/unique-in-database.decorator';

@Module({
  imports:[
    TypeOrmModule.forFeature([UsuarioEntity,PerfilEntity]),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService,IsInDatabaseConstraint,UniqueInDatabaseConstraint],
  exports:[UsuariosService],
})
export class UsuariosModule {}
