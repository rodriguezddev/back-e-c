import { ProductoEntity } from "src/productos/entities/producto.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'categoria'})
export class CategoriaEntity {
    @PrimaryGeneratedColumn('increment')
    id:number

    @Column({type:'varchar',length:50,unique:true})
    nombre:string

    @Column({type:'int',default:0})
    descuento:number

    @OneToMany(() => ProductoEntity,(producto) => producto.categoria,{nullable:true,cascade:true})
    productos:ProductoEntity[]
}
