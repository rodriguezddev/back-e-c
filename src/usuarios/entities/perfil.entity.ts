import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, Unique } from "typeorm";
import { UsuarioEntity } from "./usuario.entity";
import { PedidoEntity } from "src/pedidos/entities/pedido.entity";

@Entity({name:'perfil'})
export class PerfilEntity{
    @PrimaryGeneratedColumn('increment')
    id:number

    @Column({type:'varchar',length:50})
    nombre:string

    @Column({type:'varchar',length:50})
    apellido:string

    @Column({type:'varchar',length:50,nullable:true})
    direccion:string

    @Column({type:'varchar',length:20,unique:true})
    cedula:string

    @Column({type:'varchar',length:20,unique:true})
    numeroTelefono:string

    @OneToOne(() => UsuarioEntity,{nullable:true,onDelete:'CASCADE'})
    @JoinColumn()
    usuario:UsuarioEntity

    @OneToMany(() => PedidoEntity,(pedidos) => pedidos.perfil)
    pedidos:PedidoEntity[]

}