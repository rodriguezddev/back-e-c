import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PedidoItemEntity } from "./pedidoItem.entity";
import { TipoDePedido } from "../enum/tipoDePedido.enum";
import { PerfilEntity } from "src/usuarios/entities/perfil.entity";
import { EnvioEntity } from "src/envios/entities/envio.entity";
import { EstadoDePedido } from "../enum/estadosPedido.enum";
import { PagoEntity } from "src/pagos/entities/pago.entity";
import { UsuarioEntity } from "src/usuarios/entities/usuario.entity";
import { FacturaEntity } from "src/facturas/entities/factura.entity";


@Entity({name:'pedido'})
export class PedidoEntity {
    @PrimaryGeneratedColumn('increment')
    id:number

    @Column({type:'enum',enum:TipoDePedido})
    tipoDePedido:TipoDePedido
       
    @Column({type:'enum',default:EstadoDePedido.Verificacion,enum:EstadoDePedido})
    estado:EstadoDePedido

    @Column({type:'boolean',default:false})
    pagado:boolean

    @CreateDateColumn({type:'timestamp with time zone'})
    fecha:Date

    @Column({type:'boolean', default:false})
    cancelado:boolean

    @ManyToOne(()=> PerfilEntity,(perfil) => perfil.pedidos,{nullable:false,onDelete:'CASCADE'})
    @JoinColumn()
    perfil:PerfilEntity

    @ManyToOne(() => UsuarioEntity,(usuario) => usuario.ventas ,{nullable:true} )
    vendedor:UsuarioEntity

    @OneToMany(() => PedidoItemEntity,(items) => items.pedido,{nullable:false,cascade:true,onDelete:'CASCADE'})
    items:PedidoItemEntity[]

    @OneToMany(() => PagoEntity,(pagos) => pagos.pedido,{nullable:true,cascade:true,onDelete:'SET NULL',eager:true})
    @JoinColumn()
    pagos:PagoEntity[]

    @OneToMany(() => EnvioEntity,(envio) => envio.pedido,{nullable:true,cascade:true,onDelete:'SET NULL'})
    envios:EnvioEntity[]

    @OneToOne(() => FacturaEntity, (factura) => factura.pedido, {nullable:true,eager:true,onDelete:'SET NULL'})
    factura:FacturaEntity

    getTotalPrice(){
        if (this.items.length > 0){
            const total_item_prices:number[] = this.items.map((item) => item.cantidad * item.producto.aplicarPrecioConDescuento())
            const total:number = total_item_prices.reduce((previous,current) => current + previous)
            return total;
        }
        return 0;
        
        
        
    }

}


