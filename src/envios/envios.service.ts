import { Injectable } from '@nestjs/common';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { UpdateEnvioDto } from './dto/update-envio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EnvioEntity } from './entities/envio.entity';
import { Repository } from 'typeorm';
import { PedidosService } from 'src/pedidos/pedidos.service';
import { EmpresaEnvioEntity } from './entities/empresaEnvio.entity';
import { CreateEmpresaEnvioDto } from './dto/create-empresaEnvio.dto';
import { UpdateEmpresaEnvioDto } from './dto/update-empresaEnvio.dto';

@Injectable()
export class EnviosService {
  constructor(
    @InjectRepository(EnvioEntity) private readonly enviosRepository:Repository<EnvioEntity>,
    @InjectRepository(EmpresaEnvioEntity) private readonly empresaEnvioRepository:Repository<EmpresaEnvioEntity>,
    private readonly pedidosService:PedidosService,
  ){}

  async createEmpresaEnvio(createEmpresaEnvioDto:CreateEmpresaEnvioDto){
    const empresa = this.empresaEnvioRepository.create({...createEmpresaEnvioDto})
    return await this.empresaEnvioRepository.save(empresa)
  }

  async create(createEnvioDto: CreateEnvioDto & {imageName?:string}) {
    const {pedidoId,empresaId} = createEnvioDto
    const empresa = typeof empresaId === 'number' ? await this.findOneEmpresaEnvio(empresaId):undefined
    const pedido = await this.pedidosService.findOne(pedidoId)
    const envio = this.enviosRepository.create(
      {
        ...createEnvioDto,
        empresa:empresa ?? undefined,
        pedido:pedido,
        fotoGuia:createEnvioDto?.imageName
      }
    )

    return await this.enviosRepository.save(envio)
  }

  async findAll() {
    return await this.enviosRepository.find({})
  }

  async findAllEmpresaEnvios(){
    return await this.empresaEnvioRepository.find({})
  }

  async findOne(id: number) {
    return await this.enviosRepository.findOneByOrFail({id:id})
  }

  async findOneEmpresaEnvio(empresaId:number){
    return await this.empresaEnvioRepository.findOneByOrFail({id:empresaId})
  }

  async update(id: number, updateEnvioDto: UpdateEnvioDto & {imageName?:string}) {
    const {empresaId} = updateEnvioDto
    const envio = await this.findOne(id)
    Object.assign(envio,updateEnvioDto)
    const empresa = typeof empresaId === 'number' ? await this.findOneEmpresaEnvio(empresaId) : undefined
    if (updateEnvioDto?.imageName){
      envio.fotoGuia = updateEnvioDto?.imageName
    }
    envio.empresa = empresa ?? envio.empresa
    return await this.enviosRepository.save(envio)

  }

  async updateEmpresaEnvio(empresaId:number,updateEmpresaEnvioDto:UpdateEmpresaEnvioDto){
    const empresa = await this.findOneEmpresaEnvio(empresaId)
    Object.assign(empresa,updateEmpresaEnvioDto)
    return await this.empresaEnvioRepository.save(empresa)
  }

  async remove(id: number) {
    const envio = await this.findOne(id)
    return await this.enviosRepository.remove(envio)
  }


  async removeEmpresaEnvio(empresaId:number){
    const empresa = await this.findOneEmpresaEnvio(empresaId)
    return await this.empresaEnvioRepository.remove(empresa)
  }
}
