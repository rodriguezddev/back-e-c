import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus} from "@nestjs/common";
import { Request, Response } from "express";
import { EntityNotFoundError, QueryFailedError } from "typeorm";

const dbErrorCodes = {
    '23505':'ERROR DE VALOR UNICO, EVITA QUE DATOS UNICOS SE REPITAN'
}
//editar
@Catch(QueryFailedError,EntityNotFoundError)
export class DbExceptionFilter implements ExceptionFilter  {
  
    catch(exception:any, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const req = ctx.getRequest<Request>()
        const res = ctx.getResponse<Response>()
        const body = {}
    
        switch (exception.constructor){
            case QueryFailedError:
                console.log(exception)
                body['message'] = exception.message
                body['code'] = exception.driverError.code
                body['detail'] = dbErrorCodes[exception.driverError.code]
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
                    {
                        statusCode:HttpStatus.INTERNAL_SERVER_ERROR,
                        body:body,
                    }
                )
                break
            case EntityNotFoundError:
                //hacer luego
                console.log('EntityNotFoundError')
                body['message'] = exception.message
                res.status(HttpStatus.NOT_FOUND).json(
                    {
                        statusCode:HttpStatus.NOT_FOUND,
                        body:body,
                    }
                )
                break
            default:
                body['error'] = exception.error
                body['message'] = exception.response.message
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
                    {
                        statusCode:HttpStatus.INTERNAL_SERVER_ERROR,
                        body:body,
                    }
                )
                
        }

       
    }
}