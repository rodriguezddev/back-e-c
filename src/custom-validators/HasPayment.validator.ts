import { registerDecorator, ValidatorOptions } from "class-validator";
import { HasPaymentConstraint } from "src/custom-constraints/has-payment.decorator";



export function HasPayment(validationOptions?:ValidatorOptions){
    return (object:Object,propertyName:string) => registerDecorator(
        {
            name:'HasPayment',
            target:object.constructor,
            propertyName:propertyName,
            constraints:[],
            options:validationOptions,
            validator:HasPaymentConstraint
        }
    )
}