import { registerDecorator, ValidationOptions } from "class-validator";
import { UniqueInDatabaseConstraint } from "src/custom-constraints/unique-in-database.decorator";



export function UniqueInDatabase<G>(entity:G,property:string,validationOptions?:ValidationOptions){
    return (object:object, propertyName:string) => registerDecorator(
        {
            target:object.constructor,
            propertyName:propertyName,
            options:validationOptions,
            constraints:[entity,property],
            validator:UniqueInDatabaseConstraint
        }
    )
}