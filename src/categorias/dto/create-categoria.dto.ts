import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min,  } from "class-validator";
import { UniqueInDatabase } from "src/custom-validators/UniqueInDatabase.validator";
import { CategoriaEntity } from "../entities/categoria.entity";


export class CreateCategoriaDto {

    @IsString()
    @IsNotEmpty()
    @UniqueInDatabase(CategoriaEntity,'nombre')
    nombre:string

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(100)
    @Type(() => Number)
    descuento:number
}
