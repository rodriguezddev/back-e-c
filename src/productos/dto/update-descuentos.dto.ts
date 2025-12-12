import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, Max, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class UpdateDescuentos{
    
    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({},{each:true})
    @Type(() => Number)
    productosId:number[]

    @IsNumber()
    @Max(100)
    @Min(0)
    @IsNotEmpty()
    @Type(() => Number)
    descuento:number
}