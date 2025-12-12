import { Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { PagoEntity } from "./pago.entity";

@Entity({name:'metodo_de_pago'})
export class MetodoDePagoEntity{

    @PrimaryGeneratedColumn('increment')
    id:number

    @Column({type:'varchar',length:50,nullable:false,unique:false})
    tipo:string

    @Column({type:'varchar',length:50,nullable:true,unique:false})
    nombre:string

    @Column({type:'varchar',length:150,unique:false, nullable:true})
    email:string

    @Column({type:'varchar',length:20,unique:false, nullable:true})
    numeroTelefono:string

    @Column({type:'varchar',length:20,nullable:true,unique:false})
    cedula:string

    @Column({type:'varchar',length:50,nullable:true,unique:false})
    banco:string

    @Column({type:'varchar',length:50,nullable:true,unique:false})
    nombreDeTitular:string

    @Column({type:'varchar',length:50,nullable:true,unique:false})
    numeroDeCuenta:string

    @Column({type:'varchar',length:50,nullable:true,unique:false})
    tipoDeCuenta:string

    @OneToMany(() => PagoEntity,(pago) => pago.metodoDePago,{nullable:true, onDelete:'SET NULL'})
    pagos:PagoEntity[]

}
