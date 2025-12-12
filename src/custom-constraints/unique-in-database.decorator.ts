import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { EntityManager } from "typeorm";


@ValidatorConstraint({async:true})
export class UniqueInDatabaseConstraint implements ValidatorConstraintInterface{
    constructor(
        private readonly entityManager:EntityManager,
    ){}

    async validate(value: any, validationArguments: ValidationArguments): Promise<boolean> {
        const [entityClass,property] = validationArguments.constraints
        const found = await this.entityManager.getRepository(entityClass).exists(
            {
                where:{
                    [property]:value
                }
            }
        )
        return !found
    }

    defaultMessage(validationArguments: ValidationArguments): string {
        return `${validationArguments.property} valor único ya existe en la base de datos.`
    }
}