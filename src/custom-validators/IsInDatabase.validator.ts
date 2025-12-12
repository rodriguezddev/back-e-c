import { ValidationOptions,registerDecorator } from "class-validator"
import { IsInDatabaseConstraint } from "src/custom-constraints/is-in-database.validator"

export function IsInDatabase<G>(entity:G,property:string,validationOptions?:ValidationOptions){
    return (object:object, propertyName:string)=> registerDecorator(
        {
            target:object.constructor,
            propertyName:propertyName,
            options:validationOptions,
            constraints:[entity,property],
            validator:IsInDatabaseConstraint,
        }
    )
}