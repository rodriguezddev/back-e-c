import { BeforeInsert, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Rol } from "../enum/rol.enum";
import { hash } from "argon2";
import { PerfilEntity } from "./perfil.entity";
import { PedidoEntity } from "src/pedidos/entities/pedido.entity";


@Entity({name:'usuario'})
export class UsuarioEntity {
     @PrimaryGeneratedColumn('increment')
     id:number

     @Column({type:'varchar',length:232,unique:true})
     username:string

     @Column({type:'enum',default:Rol.User,enum:Rol})
     rol:Rol

     @OneToMany(() => PedidoEntity,(pedido) => pedido.vendedor,{nullable:true,eager:true})
     ventas:PedidoEntity[]

     @Column({type:'varchar',length:150,unique:true})
     email:string
    
     @Column({type:'varchar',length:232,select:false})
     password:string

     @OneToOne(() => PerfilEntity,(perfil) => perfil.usuario,{nullable:true,cascade:true,onDelete:'CASCADE'})
     perfil:PerfilEntity

     @Column({type:'text',nullable:true,unique:true})
     refreshToken:string|null

     @BeforeInsert()
     async hashPassword(){
          this.password = await hash(this.password)
     }
     
}


