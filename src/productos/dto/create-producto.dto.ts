import { Type } from "class-transformer";
import { IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty, Max, Min} from "class-validator";
import { CategoriaEntity } from "src/categorias/entities/categoria.entity";
import { IsInDatabase } from "src/custom-validators/IsInDatabase.validator";
import { UniqueInDatabase } from "src/custom-validators/UniqueInDatabase.validator";
import { ProductoEntity } from "../entities/producto.entity";

export class CreateProductoDto {


    @IsString()
    @IsNotEmpty()
    @UniqueInDatabase(ProductoEntity,'nombre')
    nombre:string

    @IsString()
    @IsOptional()
    descripcion:string

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    disponible:boolean

    @IsNumber({maxDecimalPlaces:2})
    @IsOptional()
    @Max(100)
    @Min(0)
    @Type(() => Number)
    descuento:number

    @IsNumber({maxDecimalPlaces:2})
    @Min(0)
    @IsNotEmpty()
    @Type(() => Number)
    precio:number

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    aplicarDescuentoCategoria:boolean

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    stock:number

    @IsInDatabase(CategoriaEntity,'id')
    @IsOptional()
    @Type(() => Number)
    categoriaId?:number
}
