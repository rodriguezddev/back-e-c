import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Equal, Repository } from 'typeorm';
import { UsuarioEntity } from './entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PerfilEntity } from './entities/perfil.entity';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { Rol } from './enum/rol.enum';


@Injectable()
export class UsuariosService {

  constructor(
    @InjectRepository(UsuarioEntity) private readonly UsuarioRepository:Repository<UsuarioEntity>,
    @InjectRepository(PerfilEntity) private readonly PerfilRepository:Repository<PerfilEntity>,
  ){}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const createPerfilDto:CreatePerfilDto | undefined = createUsuarioDto?.perfil 
    const usuario = this.UsuarioRepository.create(
      {
        ...createUsuarioDto,
        rol:createUsuarioDto.rol ?? Rol.User,
        perfil:createPerfilDto ? createPerfilDto : undefined
      }
    )
    return await this.UsuarioRepository.save(usuario)
   
  }

  async createPerfil(createPerfilDto:CreatePerfilDto){
    const perfil:PerfilEntity = this.PerfilRepository.create(
      {
        ...createPerfilDto,
      }
    )

    //asignar usuario
    const usuarioId:number | undefined = createPerfilDto?.usuarioId
    if (usuarioId){
      const usuario:UsuarioEntity = await this.findOne(usuarioId)
      if (usuario.perfil) throw new ConflictException('El usuario ya tiene un perfil asignado')
      perfil.usuario = usuario
    }

    return await this.PerfilRepository.save(perfil)
  }

  async findAll() {
    return await this.UsuarioRepository.find(
      {
        relations:{
          perfil:true
        }
      }
    )
  }

  async findAllPerfiles(){
    return await this.PerfilRepository.find({})
  }

  async findOne(id: number) {
    return await this.UsuarioRepository.findOneOrFail(
      {
        where:{
          id:Equal(id)
        },
    
        
        relations:{
          perfil:true
        }
      }
    )
  }

  async findOneByUsername(username:string){
    return await this.UsuarioRepository.findOneOrFail({
      where:{username:Equal(username)},select:{
        id:true,
        username:true,
        password:true,
        rol:true,
        email:true,
        refreshToken:true,
        perfil:{
          id:true
        },
      },
      relations:['perfil']
    })
  }

  async findOneByEmail(email:string){
    return await this.UsuarioRepository.findOneOrFail(
      {
        where:{
          email:Equal(email)
        },
        select:{
          id:true,
          username:true,
          password:true,
          rol:true,
          email:true,
          perfil:{
            id:true
          },

        }
      }
    )
  }

  async findOnePerfil(id:number){
    return await this.PerfilRepository.findOneOrFail(
      {
        where:{
          id:Equal(id)
        },
        select:['id','nombre','apellido','direccion','cedula','numeroTelefono'],
        relations:{
          usuario:true
        }
      }
    )
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.UsuarioRepository.findOneByOrFail(
      {
        id:id
      }
    )
    Object.assign(usuario,updateUsuarioDto)
    return await this.UsuarioRepository.save(usuario)
  }

  async updatePerfil(id:number,updatePerfilDto:UpdatePerfilDto){
    const perfil = await this.findOnePerfil(id)
    Object.assign(perfil,updatePerfilDto)
    
    const usuarioId:number | undefined = updatePerfilDto?.usuarioId
    if (usuarioId){
      const usuario:UsuarioEntity = await this.findOne(usuarioId)
      perfil.usuario = usuario
    }

    return await this.PerfilRepository.save(perfil)
  }

  async updateOwnPerfil(user:{sub:number,username:string,role:Rol,profileId:number},updatePerfilDto:UpdatePerfilDto){
    const perfil = await this.findOnePerfil(user.profileId)
    Object.assign(perfil,updatePerfilDto)
    return await this.PerfilRepository.save(perfil)
  }


  async remove(id: number) {
    const usuario = await this.findOne(id)
    return await this.UsuarioRepository.remove(usuario)
  }

  async removePerfil(id:number){
    const perfil = await this.findOnePerfil(id)
    return await this.PerfilRepository.remove(perfil)
  }

  async save(user:UsuarioEntity){
    return await this.UsuarioRepository.save(user)
  }
}
