import { ValidationOptions,ValidationArguments,registerDecorator } from "class-validator";


export function IsVePhoneNumber(validationOptions?:ValidationOptions){
    return (object:Object,propertyName:string) => registerDecorator(
        {
            name:'IsVePhoneNumber',
            target:object.constructor,
            propertyName:propertyName,
            constraints:[],
            options:validationOptions,
            validator:{
                validate(value:any, args:ValidationArguments){
                    const validatorRegExp = new RegExp('^04(12|24|14|16|26|22)-[0-9]{7}$')
                    const valid = RegExp(validatorRegExp).test(value)
                    return typeof value === 'string' && valid
                }
            }

        }
    )
}