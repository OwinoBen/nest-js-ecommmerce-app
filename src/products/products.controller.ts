import { Body, Controller, Delete, FileTypeValidator, Get, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, ParseFilePipeBuilder, ParseUUIDPipe, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { AddProductDto, UpdateProductDto } from './dto';
import { ProductsService } from './products.service';

@UseGuards(JwtGuard)
@Controller('products')
export class ProductsController {
    constructor(private productService: ProductsService){}

    @Post('add')
    @UseInterceptors(FilesInterceptor('files', 5,{
        storage: diskStorage({
            destination:'./upload/productImages',
            filename:(req,file,cb)=>{
                const filename: string =path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4()
                const extension: string = path.parse(file.originalname).ext

                cb(null, `${filename}${extension}`)
            }
        })
    })) 
    addProducts(@Body() dto: AddProductDto, @GetUser('id') userId: number,  @UploadedFiles(new ParseFilePipeBuilder()
        .addFileTypeValidator({
            fileType: 'image',

        }).build({ //.addMaxSizeValidator({
            //maxSize:50
        //})
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
    ) productImage: Array<Express.Multer.File>){
        // console.log(productImage)
        
        return this.productService.addProducts(dto,userId, productImage)
    }

    @Get()
    getAllProducts(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search:string,
        @GetUser('id') userId:number
    ){
        limit = limit > 100 ? 100 : limit
        return this.productService.getAllProducts({page:Number(page), limit:Number(limit), path: 'http://localhost:6000/products'}, search, userId)
    }

    @Get(':productId')
    getProductById(@GetUser('id') userId: number, @Param('productId') productId:string){
        return this.productService.getProductById(userId, productId)
    }

    @Patch('edit/:productId')
    editProduct(@GetUser('id') userId: number, @Body() dto: UpdateProductDto, @Param('productId') productId: string){
        return this.productService.editProduct(userId, productId, dto)
    }

    @Delete('remove/:productId')
    deleteProductById(@GetUser('id') userId: number, @Param('productId', ParseUUIDPipe) productId: string){
        return this.productService.deleteProductById(userId, productId)
        
    }
}
