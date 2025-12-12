import { ValidationArguments, ValidatorConstraint,ValidatorConstraintInterface } from "class-validator";
import { CreatePedidoItemDto } from "src/pedidos/dto/create-pedido-item.dto";


@ValidatorConstraint({async:true})
export class IsNotDuplicatedNumberConstraint implements ValidatorConstraintInterface{
    validate(value: CreatePedidoItemDto[], args?: ValidationArguments): boolean  {
        if (value){
            const uniqueIds = new Set(value.map((item) => item.productoId))
            return value.length === uniqueIds.size
        }
        
        return false
        
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        return `${validationArguments?.targetName}.${validationArguments?.property} debe tener productos unicos `
    }
}