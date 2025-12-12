import { IsNotEmpty, IsNumber } from "class-validator";
import { ProductoEntity } from "src/productos/entities/producto.entity";
import { IsInDatabase } from "src/custom-validators/IsInDatabase.validator";


export class CreatePedidoItemDto{

    @IsNumber()
    @IsNotEmpty()
    cantidad:number

    @IsNumber()
    @IsInDatabase(ProductoEntity,'id')
    @IsNotEmpty()
    productoId:number

}