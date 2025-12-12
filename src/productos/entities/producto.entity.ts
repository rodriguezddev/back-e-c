import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CategoriaEntity } from "src/categorias/entities/categoria.entity";
import {v4 as uuid} from 'uuid';
import { PedidoItemEntity } from "src/pedidos/entities/pedidoItem.entity";
import { DecimalToTransformer } from "../transformers/string-to-decimal.transformer";


@Entity({name:'producto'})
export class ProductoEntity {
    @PrimaryGeneratedColumn('increment')
    id:number

    @Column({type:'text',nullable:true})
    image:string

    @Column({type:'varchar',length:50,nullable:false,unique:true})
    nombre:string

    @Column({type:'text',nullable:true,default:""})
    descripcion:string

    @Column({type:'boolean', default:false})
    disponible:boolean

    @Column({type:'int',default:0})
    descuento:number

    @Column({type:'decimal', nullable:false,transformer:new DecimalToTransformer(),precision:5,scale:2})
    precio:number

    @Column({type:'boolean',default:true})
    aplicarDescuentoCategoria:boolean

    @Column({type:'int',default:1})
    stock:number

    @Column({type:'varchar', length:50, unique:true, nullable:false})
    codigo:string

    @ManyToOne(() => CategoriaEntity,(categoria) => categoria.productos,{nullable:true,eager:true,onDelete:'SET NULL'})
    @JoinColumn()
    categoria:CategoriaEntity

    @OneToMany(() => PedidoItemEntity,(pedidoItem) => pedidoItem.producto,{nullable:true,cascade:true,onDelete:'CASCADE'})
    pedidoItems:PedidoItemEntity[]

    @BeforeInsert()
    generateUuid(){
        const sku_uuid = uuid().split('-').slice(0,2)
        this.codigo = sku_uuid.join('-')
    }
 
    aplicarPrecioConDescuento(){
        if (this.precio >= 0){
            if (this.categoria && this.categoria.descuento > 0 && this.categoria.descuento < 101 && this.aplicarDescuentoCategoria){
                let precioConDescuento = this.precio - ((this.categoria.descuento * this.precio)/100)
                return precioConDescuento
            }
            if (this.descuento > 0 && this.descuento < 101){
                let precioConDescuento = this.precio - ((this.descuento * this.precio)/100);
                return precioConDescuento
            }
            else{
                return this.precio
            }
        }
        return 0
    }
}
