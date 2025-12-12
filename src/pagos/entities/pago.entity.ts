import { Column, Entity, PrimaryGeneratedColumn,ManyToOne, CreateDateColumn} from "typeorm";
import { PedidoEntity } from "src/pedidos/entities/pedido.entity";
import { FormaDePago } from "../enum/formaDePago.enum";
import { FacturaEntity } from "src/facturas/entities/factura.entity";
import { DecimalToTransformer } from "src/productos/transformers/string-to-decimal.transformer";
import { Exclude } from "class-transformer";
import { MetodoDePagoEntity } from "./metodosDePago.entity";


@Entity({name:'pago'})
export class PagoEntity{

    @PrimaryGeneratedColumn('increment')
    id:number

    @Column({type:'text',nullable:true})
    image:string

    @ManyToOne(() => PedidoEntity,(pedido) => pedido.pagos,{nullable:true})
    pedido:PedidoEntity

    @Exclude()
    @ManyToOne(() => FacturaEntity, (factura) => factura.pagos,{nullable:true,cascade:true,onDelete:'SET NULL'})
    factura: FacturaEntity;

    @Column({type:'enum',enum:FormaDePago,default:FormaDePago.PagoMovil})
    nombreFormaDePago:FormaDePago

    @ManyToOne(() => MetodoDePagoEntity,(metodoDePago) => metodoDePago.pagos,{nullable:true,onDelete:'SET NULL'})
    metodoDePago:MetodoDePagoEntity

    @Column({type:'decimal',nullable:false,transformer:new DecimalToTransformer(),precision:39,scale:2})
    monto:number

    @Column({type:'decimal',nullable:true,transformer:new DecimalToTransformer(),precision:5,scale:2})
    tasaBsDelDia:number

    @Column({type:'varchar',length:14,nullable:true})
    numeroReferencia:string

    @CreateDateColumn({type:'timestamp with time zone'})
    fecha:Date

    @Column({type:'boolean', default:false})
    cancelado:boolean
}