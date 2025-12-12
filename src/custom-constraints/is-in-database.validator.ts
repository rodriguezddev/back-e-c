import { BadRequestException } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint,ValidatorConstraintInterface } from "class-validator";
import { EntityManager } from "typeorm";

@ValidatorConstraint({async:true})
export class IsInDatabaseConstraint implements ValidatorConstraintInterface{
    constructor(
        private readonly entityManager:EntityManager
    ){}

    async validate(value: number, args: ValidationArguments): Promise<boolean>{
        if (!(typeof value === 'number')) throw new BadRequestException('ID de la entidad debe ser numerica.')
        const [entityClass, property= 'id'] = args.constraints
        const repository = this.entityManager.getRepository(entityClass)
        const found = await repository.exists(
            {
                where:{
                    [property]:value
                }
            }
        )
        return found
    }

    defaultMessage(args: ValidationArguments):string {
        return `${args.property} no existe en la base de datos`
    }

}

