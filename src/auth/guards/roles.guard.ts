import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { AllowRoles } from "../decorators/roles.decorator";
import { IS_PUBLIC_KEY } from "../decorators/isPublic.decorator";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor(
        private readonly reflector:Reflector
    ){}

    async canActivate(context: ExecutionContext):Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,[context.getHandler(),context.getClass()])
        
        if (isPublic){
            return true
        }
        const req:Request & {user:{sub:number,username:string,rol:string}} = context.switchToHttp().getRequest()
        const roles = this.reflector.get(AllowRoles,context.getHandler())
        
        const hasAccess = await this.matchRoles(req.user.rol,roles)
        if (hasAccess){
            return true
        }
        throw new ForbiddenException(`Solo los roles ${roles} tienen acceso.`)
    }

    async matchRoles(role:string,roles:string[]):Promise<boolean>{
        return roles.includes(role) 
    }
}