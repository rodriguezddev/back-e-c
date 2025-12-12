import { BadRequestException, ConflictException, Injectable, NotFoundException, Req } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PedidoEntity } from './entities/pedido.entity';
import { Between, Equal, IsNull, Not, Repository } from 'typeorm';
import { PedidoItemService } from './pedidoItem.service';
import { PedidoItemEntity } from './entities/pedidoItem.entity';
import { CreatePedidoItemDto } from './dto/create-pedido-item.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Rol } from 'src/usuarios/enum/rol.enum';
import { TipoDePedido } from './enum/tipoDePedido.enum';
import { DateParameters } from 'src/reportes/types/dateParameter.type';
import { FormaDePago } from 'src/pagos/enum/formaDePago.enum';
import { ProductosService } from 'src/productos/productos.service';

@Injectable()
export class PedidosService {

  constructor(
    @InjectRepository(PedidoEntity) private readonly pedidoRepository:Repository<PedidoEntity>,
    private readonly pedidoItemService:PedidoItemService,
    private readonly usuariosService:UsuariosService,
    private readonly productosService:ProductosService,
  ){}

  async create(user:{sub:number,username:string,rol:Rol,profileId:number},createPedidoDto: CreatePedidoDto) {
    const createPedidoItemsDtos:CreatePedidoItemDto[] = createPedidoDto.items
    const pedidoItems:PedidoItemEntity[] = await Promise.all( createPedidoItemsDtos.map(async(item) => {
      const pedidoItem = await this.pedidoItemService.create(item)
      return pedidoItem
    }))
    
    const pedido = this.pedidoRepository.create(
      {
        tipoDePedido:createPedidoDto.tipoDePedido,
        pagado:createPedidoDto.pagado ?? false,
        estado:createPedidoDto.estado ?? undefined,
      }
    )
    const usuario = await this.usuariosService.findOne(user.sub)
    if (user.rol === Rol.User){
      if (usuario.perfil === null) throw new ConflictException('Es necesario tener un perfil para crear un pedido.')
      pedido.perfil = usuario.perfil
      
    }

    if(user.rol === Rol.Seller || user.rol === Rol.Admin){
      if (!(typeof createPedidoDto.perfilId === 'number'))throw new ConflictException('Es necesario un perfilId para crear el pedido.')
      
      const perfil = await this.usuariosService.findOnePerfil(createPedidoDto.perfilId)
      pedido.vendedor = usuario
      pedido.perfil = perfil
    }
    
    pedido.items = pedidoItems
    return await this.pedidoRepository.save(pedido,{reload:true})
  }

async getTotalValuesSales(dateParameters: DateParameters,seller?:string) {
    const from = new Date(dateParameters.fromYear, dateParameters.fromMonth, dateParameters.fromDay);
    const to = new Date(dateParameters.untilYear, dateParameters.untilMonth, dateParameters.untilDay);

    // Obtener tasa de cambio del día
    const response_json = await (await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {method: 'GET'})).json();
    const tasaBsDelDia = response_json.promedio;
    console.log(tasaBsDelDia)
    // Obtener las ventas
    const query = await this.pedidoRepository
        .createQueryBuilder('pedido')
        .leftJoin('pedido.vendedor', 'vendedor')
        .leftJoin('pedido.perfil', 'comprador')
        .leftJoin('pedido.pagos', 'pagos')
        .leftJoin('pedido.items', 'items')
        .leftJoin('pedido.factura','factura')
        .leftJoin('items.producto', 'producto')
        .leftJoin('producto.categoria', 'categoria')
        .select(['vendedor.id', 'vendedor.username', 'comprador.nombre','factura.id','factura.fecha'])
        .addSelect(`JSON_AGG(
            JSON_BUILD_OBJECT(
                'nombreFormaDePago', pagos.nombreFormaDePago,
                'monto', pagos.monto
            )
        )`, 'pagos')
        .where('pedido.vendedor IS NOT NULL')
        .where('pedido.factura IS NOT NULL')
        .where('pedido.pagado IS TRUE')
        //debe estar pagado!!!
        .andWhere('pedido.fecha >= :from', { from: from })
        .andWhere('pedido.fecha <= :to', { to: to })
        
    if (seller) {
      query.andWhere('vendedor.username = :username', { username: seller });
    }
    query.groupBy('vendedor.id, vendedor.username, comprador.id, factura.id')
    const ventas = await query.getRawMany();
    // Procesar los resultados para agrupar por tipo de pago
    const processedResults = ventas.map(venta => {
        // Definir qué métodos de pago son en USD y cuáles en BS
        const metodosPagoUSD = ['ZELLE', 'EFECTIVO']; // Estos métodos son en dólares
        const metodosPagoBS = ['PAGOMOVIL', 'TRANSFERENCIA', 'EFECTIVOBS']; // Estos métodos son en bolívares

        // Inicializar todos los tipos de pago con 0
        const paymentTypes = {
            'PAGOMOVIL': 0,
            'TRANSFERENCIA': 0,
            'ZELLE': 0,
            'EFECTIVO': 0,
            'EFECTIVOBS': 0
        };


        // Sumar los montos por cada tipo de pago
        // **CAMBIO:** Se añade una verificación para evitar el error si nombreFormaDePago es null o undefined
        venta.pagos.forEach(pago => {
            const tipoPago = pago.nombreFormaDePago ? pago.nombreFormaDePago.toUpperCase() : null;
              if (tipoPago && paymentTypes.hasOwnProperty(tipoPago)) {
                paymentTypes[tipoPago] += parseFloat(pago.monto);
            }
        });

        // Calcular montos totales
        let MONTO = 0; // Total en dólares
        let MONTOBS = 0; // Total en bolívares

        // Sumar montos en dólares
        metodosPagoUSD.forEach(metodo => {
            MONTO += paymentTypes[metodo];
            MONTOBS += paymentTypes[metodo] * tasaBsDelDia;
        });

        // Sumar montos en bolívares (convertidos a dólares para MONTO)
        metodosPagoBS.forEach(metodo => {
            MONTO += paymentTypes[metodo] / tasaBsDelDia;
            MONTOBS += paymentTypes[metodo];
        });


        const dateObject = new Date(venta.factura_fecha); 
        const formattedDate = dateObject.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: '2-digit' 
        });

        // Crear el objeto resultante
        return {
            fecha_de_recibo:formattedDate,
            numero_de_recibo:venta.factura_id,
            vendedor_id: venta.vendedor_id,
            vendedor_username: venta.vendedor_username,
            comprador_nombre: venta.comprador_nombre,
            MONTO: parseFloat(MONTO.toFixed(2)), // Total en dólares
            MONTOBS: parseFloat(MONTOBS.toFixed(2)), // Total en bolívares
            PAGOMOVIL: paymentTypes.PAGOMOVIL,
            TRANSFERENCIA: paymentTypes.TRANSFERENCIA,
            ZELLE: paymentTypes.ZELLE,
            EFECTIVO: paymentTypes.EFECTIVO,
            EFECTIVOBS: paymentTypes.EFECTIVOBS,
            //TASA_CAMBIO: tasaBsDelDia // Opcional: incluir la tasa usada
        };
    });
    return [processedResults, tasaBsDelDia];
}
  async getTotalValuesFromSales(dateParameters:DateParameters){
    const from = new Date(dateParameters.fromYear,dateParameters.fromMonth,dateParameters.fromDay)
    const to = new Date(dateParameters.untilYear,dateParameters.untilMonth,dateParameters.untilDay)

    //Valor total envios online
    const ventasOnline = await this.pedidoRepository.find(
      {
        where:{
          tipoDePedido:TipoDePedido.Online,
          vendedor:Not(IsNull()),
          pagado:true,
          fecha:Between(from,to)
        },
        relations:{
          vendedor:true,
          items:{
            producto:true
          }
        }
      }
    )
    //Valor total ventas tienda
    const ventasTienda = await this.pedidoRepository.find(
      {
        where:{
          tipoDePedido:TipoDePedido.Tienda,
          vendedor:Not(IsNull()),
          pagado:true,
          fecha:Between(from,to)
        },
        relations:{
          vendedor:true,
          items:{
            producto:true
          }
        }
      }
    )
    //vendedores con mas ventas
    const mayoresVendedores = await this.pedidoRepository
    .createQueryBuilder('pedido')
    .leftJoin('pedido.vendedor','vendedor')
    .leftJoin('pedido.items','items')
    .leftJoin('items.producto','producto')
    .leftJoin('producto.categoria','categoria')
    .select(['vendedor.id','vendedor.username'])
    .addSelect(`COUNT(CASE pedido.tipoDePedido WHEN 'Tienda' THEN pedido.id END)`,'ventasTienda')
    .addSelect(`COUNT(CASE pedido.tipoDePedido WHEN 'Online' THEN pedido.id END)`,'ventasOnline')
    .addSelect('COUNT(pedido.id)','ventasTotales')
    .addSelect(`ROUND(SUM(items.cantidad*((producto.precio-(producto.precio * producto.descuento)/100) - ((categoria.descuento * (producto.precio-(producto.precio * producto.descuento)/100))/100))),2)`,'valorTotal')
    .addSelect(
      `ROUND(SUM(CASE pedido.tipoDePedido WHEN 'Tienda' THEN (items.cantidad*((producto.precio-(producto.precio * producto.descuento)/100) - ((categoria.descuento * (producto.precio-(producto.precio * producto.descuento)/100))/100))) ELSE 0 END), 2)`,
      'valorTotalTienda',
    )
    .addSelect(
      `ROUND(SUM(CASE pedido.tipoDePedido WHEN 'Online' THEN (items.cantidad*((producto.precio-(producto.precio * producto.descuento)/100) - ((categoria.descuento * (producto.precio-(producto.precio * producto.descuento)/100))/100))) ELSE 0 END), 2)`,
      'valorTotalOnline',
    )
    .where('pedido.vendedor IS NOT NULL')
    .andWhere('pedido.pagado = :pagado',{pagado:true})
    .andWhere('pedido.fecha >= :from',{from:from})
    .andWhere('pedido.fecha <= :to',{to:to})
    .groupBy('vendedor.id')
    .limit(5)
    .orderBy('COUNT(pedido.id)','DESC')
    .getRawMany()
    let valorTotalEnviosOnline = 0
    let valorTotalVentasTienda = 0
    let mejor_vendedor_valor = 0
    ventasOnline.forEach((venta) => {
      valorTotalEnviosOnline += venta.getTotalPrice()
      if (mayoresVendedores[0].vendedor_username === venta.vendedor.username){
        mejor_vendedor_valor += venta.getTotalPrice()
      }
    })
    ventasTienda.forEach((venta) => {
      valorTotalVentasTienda += venta.getTotalPrice()
      if (mayoresVendedores[0].vendedor_username === venta.vendedor.username){
        mejor_vendedor_valor += venta.getTotalPrice()
      }
    })
    const valoresTotales = {
      mayoresVendedores,
      mejor_vendedor_valor:Math.round(mejor_vendedor_valor),
      enviosOnline:{
        enviosTotales:ventasOnline.length,
        valorTotalEnviosOnline:Math.round(valorTotalEnviosOnline)
      },
      ventasTienda:{
        ventasTotales:ventasTienda.length,
        valorTotalVentasTienda:Math.round(valorTotalVentasTienda)
      },
      valorTotal: Math.round(valorTotalEnviosOnline + valorTotalVentasTienda)//todas las ventas
    }
    return valoresTotales
  }

  async getTotalSalesFromCategory(dateParameters: DateParameters) {
  const from = new Date(dateParameters.fromYear, dateParameters.fromMonth, dateParameters.fromDay);
  const to = new Date(dateParameters.untilYear, dateParameters.untilMonth, dateParameters.untilDay);

  const categoriasVendidas = await this.pedidoRepository
    .createQueryBuilder('pedido')
    .leftJoin('pedido.items', 'items')
    .leftJoin('items.producto', 'producto')
    .leftJoin('producto.categoria', 'categoria')
    .select([
      'categoria.id AS categoria_id',
      'categoria.nombre AS categoria_nombre',
      'SUM(items.cantidad) AS totalproductos'
    ])
    .addSelect(`
      ROUND(
        SUM(
          items.cantidad *
          (
            CASE
              WHEN producto.descuento BETWEEN 1 AND 100
                THEN producto.precio - (producto.precio * producto.descuento / 100.0)
              ELSE producto.precio
            END
            *
            CASE
              WHEN producto."aplicarDescuentoCategoria" = true AND categoria.descuento BETWEEN 1 AND 100
                THEN (1 - categoria.descuento / 100.0)
              ELSE 1
            END
          )
        ), 2
      )
    `, 'totalgenerado')
    .where('pedido.pagado = :pagado', { pagado: true })
    .andWhere('pedido.fecha >= :from', { from: from })
    .andWhere('pedido.fecha <= :to', { to: to })
    .groupBy('categoria.id')
    .orderBy('totalgenerado', 'DESC')
    .getRawMany();

  const resumenPorCategoria = categoriasVendidas.map(item => ({
    categoria_id: item.categoria_id,
    categoria_nombre: item.categoria_nombre,
    totalProductoPorCategoria: parseInt(item.totalproductos, 10),
    totalGenerado: parseFloat(item.totalgenerado)
  }));
  
  return resumenPorCategoria;
}

  async getSoldProductsReport(order:'ASC'|'DESC',limit?:number){
    const query = await this.pedidoRepository
    .createQueryBuilder('pedido')
    .leftJoin('pedido.items','items')
    .leftJoin('items.producto','producto')
    .select(['producto.id','producto.nombre','producto.codigo'])
    .addSelect('SUM(items.cantidad)','totalProductos')
    .where('pedido.pagado = :pagado',{pagado:true})
    .groupBy('producto.id')
    .orderBy('SUM(items.cantidad)',order)
    
    if(limit){
      query.limit(limit)
    }
    const productosVendidos = query.getRawMany()
    return productosVendidos
  }

  async getCurrentStock(){
    return await this.productosService.findAllWithStock()
  }

async findAll(perfil_id?: number) {
  const query = this.pedidoRepository.createQueryBuilder('pedido')
    .leftJoinAndSelect('pedido.perfil', 'perfil')
    .leftJoinAndSelect('pedido.items', 'items')
    .leftJoinAndSelect('items.producto', 'producto')
    .leftJoinAndSelect('pedido.vendedor', 'vendedor')
    .leftJoinAndSelect('pedido.envios', 'envios')
    .leftJoinAndSelect('pedido.factura','factura')
    .leftJoinAndSelect('pedido.pagos','pagos');
  if (perfil_id) {
    // Assuming you want to filter pedidos by a user_id on the 'perfil' or 'vendedor' entity.
    // You'll need to adjust this condition based on your specific database schema.
    query.where('perfil.id = :perfil_id', { perfil_id });
  }

  const pedidos = await query.getMany();
  
  pedidos.map((pedido) => (pedido['precioTotal'] = pedido.getTotalPrice()));
  
  return pedidos;
}

  

  async findOne(id: number) {
    const pedido = await this.pedidoRepository.findOneOrFail({where:{id:id},relations:{items:{producto:true},perfil:true}})
    pedido.items.map((item) => item.producto['precioConDescuento'] = item.producto.aplicarPrecioConDescuento())
    pedido['precioTotal'] = pedido.getTotalPrice()
    return pedido
  }


  async findOwnPedidos(user:{sub:number,username:string,role:Rol,profileId:number}){
    const usuarioPedidos = await this.pedidoRepository.find(
      {
        where:{
          perfil:{
            id:user.profileId
          }
        },
        relations:{
          items:{
            producto:true
          }
        },
        order:{
          fecha:'DESC'
        }
      }
    )
    usuarioPedidos.map((pedido) => pedido['precioTotal'] = pedido.getTotalPrice())
    return usuarioPedidos
  }

  async findOwnVentas(user:{sub:number,username:string,role:Rol,profileId:number}){
    const usuarioVentas = await this.pedidoRepository.find(
      {
        where:{
          vendedor:{
            id:user.sub
          }
        },
        order:{
          fecha:'DESC'
        }
      }
    )
    return usuarioVentas
  }

  async findOwnOne(user:{sub:number,username:string,role:Rol,profileId:number},id:number){
    const pedido = await this.pedidoRepository.findOneOrFail(
      {
        where:{
          id:id,
          perfil:{
            id:user.profileId
          }
        },
        relations:{
          envios:true,
          pagos:true,
          items:{
            producto:true
          }
        }
      }
    )
    pedido['precioTotal'] = pedido.getTotalPrice()
    return pedido
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    const pedido = await this.findOne(id)
    const pedidoItemIds = pedido.items.map((item) => item.id)
    const {items,...pedidoData} = updatePedidoDto
    Object.assign(pedido,pedidoData)
    const updatedPedido = await this.pedidoRepository.save(pedido)

    const updatedItems:Promise<PedidoItemEntity>[] | undefined = items?.map(async (item)=>{
      if (pedidoItemIds.includes(item.pedidoItemId)){
        const pedidoItem = await this.pedidoItemService.update(item.pedidoItemId,item)
        return pedidoItem
      }
      throw new NotFoundException(`item con el id ${item.pedidoItemId} no se encuentra en el pedido con id ${pedido.id}, solo las ids ${pedidoItemIds} estan relacionadas.`)
      
    })

    if (updatedItems){
        updatedPedido.items = await Promise.all(updatedItems)
    }

    return updatedPedido
  }

  async addPedidoItems(pedidoId:number,createPedidoItemsDtos:CreatePedidoItemDto[]){
    const pedido = await this.findOne(pedidoId)
    const productIds = pedido.items.map((item) =>{
      return item.producto.id
    } )
    const pedidoItems:PedidoItemEntity[] = await Promise.all( createPedidoItemsDtos.map(async (item) => {
      if (productIds.includes(item.productoId)){
        throw new BadRequestException(`Producto con id ${item.productoId} ya existe en el pedido, solo las los productos con id ${productIds} estan relacionados.`)
      }
      const pedidoItem = await this.pedidoItemService.create(item)
      pedidoItem.pedido = pedido
      return await this.pedidoItemService.save(pedidoItem)
    }))
    return pedidoItems

  }

  async removePedidoItems(pedidoId:number,itemsIds:number[]){
    const pedido = await this.findOne(pedidoId)
    const pedidoItemsIds = pedido.items.map((item) => item.id)
    const deletedPedidoItems:(PedidoItemEntity | undefined)[] = await Promise.all(itemsIds.map(async (itemId) => {
      if (pedidoItemsIds.includes(itemId)){
        return await this.pedidoItemService.remove(itemId)
      }
      throw new BadRequestException(`Item con el id ${itemId} no existe en pedido con id ${pedido.id}, solo los items con id ${pedidoItemsIds} estan relacionados.`)
    }))
    return deletedPedidoItems
  }

  async save(pedidoEntity:PedidoEntity){
    return await this.pedidoRepository.save(pedidoEntity)
  }

  async remove(id: number) {
    const pedido = await this.findOne(id)
    return await this.pedidoRepository.remove(pedido)
  }
}
