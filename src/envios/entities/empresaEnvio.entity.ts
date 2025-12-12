import { Column, Entity, PrimaryGeneratedColumn, OneToMany,JoinColumn } from "typeorm";
import { EnvioEntity } from "./envio.entity";

@Entity({name:'empresa'})
export class EmpresaEnvioEntity{
    @PrimaryGeneratedColumn('increment')
    id:number

    @Column({type:'varchar',length:150,nullable:false,unique:true})
    nombre:string

    @OneToMany(() => EnvioEntity,(envio) => envio.empresa,{nullable:true})
    envios:EnvioEntity[]
}