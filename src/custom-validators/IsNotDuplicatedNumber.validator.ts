import { registerDecorator, ValidatorOptions } from "class-validator";
import { IsNotDuplicatedNumberConstraint } from "src/custom-constraints/is-not-duplicated-number.decorator";

export function IsNotDuplicatedNumber(validationOptions?:ValidatorOptions){
    return (object:Object,propertyName:string) => registerDecorator(
        {
            name:'IsNotDuplicatedNumber',
            target:object.constructor,
            propertyName:propertyName,
            constraints:[],
            options:validationOptions,
            validator:IsNotDuplicatedNumberConstraint
        }
    )
}