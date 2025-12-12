import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { Public } from 'src/auth/decorators/isPublic.decorator';
import { Response } from 'express';
import { DateParameters } from './types/dateParameter.type';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Rol } from 'src/usuarios/enum/rol.enum';
import { ApiOperation } from '@nestjs/swagger';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('reporte-ventas')
  @Public()
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Genera un reporte de ventas en un periodo.'})
  async getSalesReport(
    @Res() res:Response,
    @Query('fromDay') fromDay?:number,
    @Query('fromMonth') fromMonth?:number,
    @Query('fromYear') fromYear?:number,
    @Query('untilDay') untilDay?:number,
    @Query('untilMonth') untilMonth?:number,
    @Query('untilYear') untilYear?:number,
    @Query('seller') seller?:string,
  ){
    const now = new Date()
    now.setHours(0,0,0,0)
    const dateParameters:DateParameters = {
      fromDay:fromDay ?? now.getDate(),
      fromMonth:fromMonth ?? now.getMonth(), 
      fromYear:fromYear ?? now.getFullYear(), 
      untilDay:untilDay ?? now.getDate()+1, 
      untilMonth:untilMonth ?? now.getMonth(),
      untilYear:untilYear ?? now.getFullYear() 
    }
    const pdf = await this.reportesService.generateSalesReport(dateParameters,seller)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=sales-report.pdf')
    res.end(pdf)
  }

  @Public()
  @Get('reporte-ventas/categorias')
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Genera un reporte de ventas de categorias en un periodo.'})
  async getCategoryReport(
    @Res() res:Response,
    @Query('fromDay') fromDay?:number,
    @Query('fromMonth') fromMonth?:number,
    @Query('fromYear') fromYear?:number,
    @Query('untilDay') untilDay?:number,
    @Query('untilMonth') untilMonth?:number,
    @Query('untilYear') untilYear?:number
  ){
    const now = new Date()
    now.setHours(0,0,0,0)
    const dateParameters:DateParameters = {
      fromDay:fromDay ?? now.getDate(),
      fromMonth:fromMonth ?? now.getMonth(), 
      fromYear:fromYear ?? now.getFullYear(), 
      untilDay:untilDay ?? now.getDate()+1, 
      untilMonth:untilMonth ?? now.getMonth(),
      untilYear:untilYear ?? now.getFullYear() 
    }
    //revisar colocando mas productos vendidos y probar que esta bien
    const pdf = await this.reportesService.generateCategoryReport(dateParameters)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=sales-report.pdf')
    res.end(pdf)
  }

  @Public()
  @Get('reporte-ventas/productos-con-existencia-cero')
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Genera un reporte de productos con existencia cero.'})
  async getZeroExistenceProductsReport(
    @Res() res:Response,
  ){
    const pdf = await this.reportesService.generateZeroExistenceProductsReport()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=sales-report.pdf')
    res.end(pdf)
  }

  @Public()
  @Get('reporte-ventas/productos-mas-vendidos')
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Genera un reporte de productos mas vendidos.'})
  async getMostSoldProductsReport(
    @Res() res:Response,
  ){
    const pdf = await this.reportesService.generateMostSoldProductsReport()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=sales-report.pdf')
    res.end(pdf)
  }



  @Public()
  @Get('reporte-ventas/productos-menos-vendidos')
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Genera un reporte de productos menos vendidos.'})
  async getLeastSoldProductsReport(
    @Res() res:Response,
  ){
    const pdf = await this.reportesService.generateLeastSoldProductsReport()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=sales-report.pdf')
    res.end(pdf)
  }

  @Public()
  @Get('reporte-ventas/historial-productos-vendidos')
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Genera un reporte del historial de todos los productos vendidos.'})
  async getSalesHistoryProducts(
    @Res() res:Response,
  ){
    const pdf = await this.reportesService.generateSalesHistoryProducts()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=sales-report.pdf')
    res.end(pdf)
  }


  
  @Public()
  @Get('reporte-ventas/inventario-actual')
  @AllowRoles([Rol.Admin])
  @ApiOperation({summary:'Genera un reporte del inventario actual.'})
  async getCurrentInvetoryReport(
    @Res() res:Response,
  ){
    const pdf = await this.reportesService.generateCurrentInventary()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'inline; filename=sales-report.pdf')
    res.end(pdf)
  }

  //DOCUMENTAR TODO
}
