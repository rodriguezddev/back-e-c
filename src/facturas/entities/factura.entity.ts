import { Column, CreateDateColumn, Entity,JoinColumn, OneToMany,OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PagoEntity } from "src/pagos/entities/pago.entity";
import { PedidoEntity } from "src/pedidos/entities/pedido.entity";

@Entity({name:'factura'})
export class FacturaEntity{

    @PrimaryGeneratedColumn('increment')
    id:number

    @Column({type:'text'})
    descripcion:string

    @OneToMany(() => PagoEntity, (pagos) => pagos.factura)
    pagos: PagoEntity[]

    @OneToOne(() => PedidoEntity, {nullable: false, onDelete: 'CASCADE'}) // o 'RESTRICT'
    @JoinColumn()
    pedido: PedidoEntity;

    @CreateDateColumn({type:'timestamp with time zone'})
    fecha:Date
}