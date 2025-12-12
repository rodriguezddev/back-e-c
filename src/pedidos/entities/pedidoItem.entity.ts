import { ProductoEntity } from "src/productos/entities/producto.entity";
import { Column, Entity, Index, JoinColumn,ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PedidoEntity } from "./pedido.entity";

@Entity({name:'pedidoItem'})
@Index(["pedido","producto"],{unique:true})
export class PedidoItemEntity{
    @PrimaryGeneratedColumn('increment')
    id:number

    @Column({type:'int',nullable:false})
    cantidad:number

    @ManyToOne(() => ProductoEntity,{nullable:false,onDelete:'CASCADE'})
    @JoinColumn()
    producto:ProductoEntity

    @ManyToOne(() => PedidoEntity,(pedido) => pedido.items,{nullable:false,onDelete:'CASCADE'})
    pedido:PedidoEntity
}