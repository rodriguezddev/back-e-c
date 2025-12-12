import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { PedidosService } from 'src/pedidos/pedidos.service';
import { DateParameters } from './types/dateParameter.type';
import { ProductosService } from 'src/productos/productos.service';
import * as cheerio from 'cheerio';

@Injectable()
export class ReportesService {

    constructor(
      private pedidosService:PedidosService,
      private productosService:ProductosService
    ){}

    async getTemplate(name:string){
        const templateHtml = fs.readFileSync(path.join(process.cwd(),'src','reportes','reportes-templates',`${name}.html`),'utf-8')
        const template = handlebars.compile(templateHtml)
        return template
    }
 // Asegúrate de tenerlo instalado

  private imageToBase64(filePath: string): string {
    const ext = path.extname(filePath).substring(1);
    const mimeType = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        svg: 'image/svg+xml',
    }[ext] || 'application/octet-stream';

    const imageBuffer = fs.readFileSync(filePath);
    const base64Data = imageBuffer.toString('base64');
    return `data:${mimeType};base64,${base64Data}`;
}

private embedImagesInHtml(html: string): string {
    const $ = cheerio.load(html);

    // Procesar <img>
    $('img').each((_, el) => {
        const src = $(el).attr('src');
        if (src && src.startsWith('./')) {
            const imagePath = path.join(process.cwd(), 'src', 'reportes', 'reportes-templates', src);
            if (fs.existsSync(imagePath)) {
                const base64Src = this.imageToBase64(imagePath);
                $(el).attr('src', base64Src);
            }
        }
    });

    // Procesar estilos inline con background-image
    $('[style]').each((_, el) => {
        const style = $(el).attr('style') || '';
        const regex = /background-image:\s*url\(['"]?(\.\/[^'")]+)['"]?\)/;
        const match = style?.match(regex);

        if (match && match[1]) {
            const imagePath = path.join(process.cwd(), 'src', 'reportes', 'reportes-templates', match[1]);
            if (fs.existsSync(imagePath)) {
                const base64Src = this.imageToBase64(imagePath);
                const newStyle = style.replace(regex, `background-image: url('${base64Src}')`);
                $(el).attr('style', newStyle);
            }
        }
    });

    return $.html();
}



private async _generatePdf(htmlContent: string): Promise<Buffer> {
    let browser: any;
    try {
        const launchOptions: any = {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        };

        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const buffer = await page.pdf({
            printBackground: true,
            format: 'A4'
        });
        return buffer;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

    async getTotalValues(dateParameters:DateParameters,seller?:string){
      
      const [ventasTotales,tasabcv] = await this.pedidosService.getTotalValuesSales(dateParameters,seller)
      const subTotales = {
        total_monto_dolares:0,
        total_monto_bs:0,
        total_pagomovil_bs:0,
        total_transferencia_bs:0,
        total_zelle_dolares:0,
        total_efectivo_bs:0,
        total_efectivo_dolares:0,
      }
      ventasTotales.map((venta)=>{
        subTotales.total_monto_dolares += venta.MONTO
        subTotales.total_monto_bs += venta.MONTOBS
        subTotales.total_pagomovil_bs += venta.PAGOMOVIL
        subTotales.total_transferencia_bs += venta.TRANSFERENCIA
        subTotales.total_zelle_dolares += venta.ZELLE
        subTotales.total_efectivo_dolares += venta.EFECTIVO
        subTotales.total_efectivo_bs += venta.EFECTIVOBS
      })
      //SOLO FALTA CALCULAR EL SUBTOTAL, tiene que haber una fila que sume todos los pagomovil, zelle, transferencia, efectivo y monto.
      const data = {
          año:new Date().getFullYear(),
          periodoInicial:new Date(dateParameters.fromYear,dateParameters.fromMonth,dateParameters.fromDay).toLocaleDateString('es-ES'),
          periodoFinal:new Date(dateParameters.untilYear,dateParameters.untilMonth,dateParameters.untilDay).toLocaleDateString('es-ES'),
          empresa:'AUTOPARTES-MATURIN',
          ventasTotales:ventasTotales,
          subtotales:subTotales,
          tasabcv:tasabcv
      }
      //Englobar las ventas en tienda y ventas online
      //filtar por vendedor
      return data
    }

    async generateSalesReport(dateParameters:DateParameters, seller?:string){
        const data = await this.getTotalValues(dateParameters,seller) 
        const template = await this.getTemplate('daily-report')
        const html = template(data)
        const htmlWithEmbeddedImages = this.embedImagesInHtml(html);
        return this._generatePdf(htmlWithEmbeddedImages);
    }

async getCategoryValues(dateParameters: DateParameters) {
  const totalProductoPorCategoria = await this.pedidosService.getTotalSalesFromCategory(dateParameters);
  let totalValorCategorias = 0;
  totalProductoPorCategoria.map((categoria) => (totalValorCategorias += categoria.totalGenerado));

  const categoriasConPorcentaje = totalProductoPorCategoria.map((categoria) => ({
    ...categoria,
    porcentajeParticipacion:
      totalValorCategorias > 0 ? parseFloat(((categoria.totalGenerado / totalValorCategorias) * 100).toFixed(2)) : 0,
  }));

  return { totalProductoPorCategoria: categoriasConPorcentaje, totalValorCategorias };
}


async generateCategoryReport(dateParameters: DateParameters) {
  const { totalProductoPorCategoria, totalValorCategorias } = await this.getCategoryValues(dateParameters);
  const data = {
    año: new Date().getFullYear(),
    fecha_inicio: new Date(dateParameters.fromYear, dateParameters.fromMonth, dateParameters.fromDay).toLocaleDateString('es-ES'),
    fecha_fin: new Date(dateParameters.untilYear, dateParameters.untilMonth, dateParameters.untilDay).toLocaleDateString('es-ES'),
    empresa: 'AUTOPARTES-MATURIN',
    total_categorias: totalProductoPorCategoria.length,
    categorias: totalProductoPorCategoria,
    valorTotalCategorias: totalValorCategorias,
  };
  console.log(data);
  const template = await this.getTemplate('sales-category-report');
  const html = template(data);
  const htmlWithEmbeddedImages = this.embedImagesInHtml(html);
  return this._generatePdf(htmlWithEmbeddedImages);
}

    async generateZeroExistenceProductsReport(){
      const zeroProducts = await this.productosService.getZeroExistenceProducts()
      const data = {
        empresa:'AUTOPARTES-MATURIN',
        fecha_actual:new Date().toLocaleDateString('es-ES'),
        año:new Date().getFullYear(),
        productos:zeroProducts
      }
      const template = await this.getTemplate('zeroProducts-report')
      const html = template(data)
      const htmlWithEmbeddedImages = this.embedImagesInHtml(html);
      return this._generatePdf(htmlWithEmbeddedImages);
    }

    async generateMostSoldProductsReport(){
      const mostSoldProducts = await this.pedidosService.getSoldProductsReport('DESC',10)
      const data = {
        empresa:'AUTOPARTES-MATURIN',
        fecha_actual:new Date().toLocaleDateString('es-ES'),
        año:new Date().getFullYear(),
        productos:mostSoldProducts
      }
      const template = await this.getTemplate('mostSoldProducts-report')
      const html = template(data)
      const htmlWithEmbeddedImages = this.embedImagesInHtml(html);
      return this._generatePdf(htmlWithEmbeddedImages);
    }

    async generateLeastSoldProductsReport(){
      const lessSoldProducts = await this.pedidosService.getSoldProductsReport('ASC',10)
      const data = {
        empresa:'AUTOPARTES-MATURIN',
        fecha_actual:new Date().toLocaleDateString('es-ES'),
        año:new Date().getFullYear(),
        productos:lessSoldProducts
      }
      const template = await this.getTemplate('lessSoldProducts-report')
      const html = template(data)
      const htmlWithEmbeddedImages = this.embedImagesInHtml(html);
      return this._generatePdf(htmlWithEmbeddedImages);
    }
    async generateSalesHistoryProducts(){
      const allProductsSold = await this.pedidosService.getSoldProductsReport('ASC')
      const data = {
        empresa:'AUTOPARTES-MATURIN',
        fecha_actual:new Date().toLocaleDateString('es-ES'),
        año:new Date().getFullYear(),
        productos:allProductsSold
      }
      const template = await this.getTemplate('salesXProducts-report')
      const html = template(data)
      const htmlWithEmbeddedImages = this.embedImagesInHtml(html);
      return this._generatePdf(htmlWithEmbeddedImages);
    }

    async generateCurrentInventary(){
      const allProducts = await this.pedidosService.getCurrentStock()
      const data = {
        empresa:'AUTOPARTES-MATURIN',
        fecha_actual:new Date().toLocaleDateString('es-ES'),
        año:new Date().getFullYear(),
        productos:allProducts
      }
      console.log(allProducts)
      const template = await this.getTemplate('all-inventary')
      const html = template(data)
      const htmlWithEmbeddedImages = this.embedImagesInHtml(html);
      return this._generatePdf(htmlWithEmbeddedImages);
    }
    
}
