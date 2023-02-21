import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { from, map, Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { AddProductDto, UpdateProductDto } from './dto';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService){}
    //Add product to the databasee
    async addProducts(dto: AddProductDto, userId:number, productImage: Array<Express.Multer.File>){
        const user = await this.prisma.user.findUnique({
            where:{
                id:userId
            }
        })

        if(!user){
            throw new ForbiddenException('Access deenied')
        }else if(!user.isActive){
            throw new ForbiddenException('Account blocked. Contact the admin to activate your account')
        }else{
            const slug =slugify(dto.product_title,{
                replacement:'-',
                lower:true
            })
            let sku_id = 'SKU'+Math.floor((Math.random()*10000) + 1)
            const images =  productImage.map(image=>image.path) //loop through the product images 

            // check if the product exists in the database
            const product = await this.prisma.product.findUnique({
                where:{
                    slug
                }
            })

            const pro_category = await this.prisma.category.findUnique({
                where:{
                    category_id: dto.category_id
                }
            })

            if(product){
                throw new ForbiddenException('Product with the title already exist')
            }

            if(!pro_category){
                throw new ForbiddenException('Product upload requires valid category..')
            }

            return await this.prisma.product.create({
                include:{
                    product_gallery:true
                },
                data:{
                    product_title:dto.product_title,
                    slug:slug,
                    product_qty: Number(dto.product_qty), 
                    selling_price: Number(dto.selling_price),
                    discount_price: Number(dto.discount_price),
                    description:dto.description ,
                    specification: dto.specification,
                    sku: sku_id,
                    category_id:dto.category_id,
                    product_gallery:{
                        
                        createMany:{
                            data:{
                                images: images,
                            },
                            skipDuplicates:true,    
                        },
                    }
                },
            })
        }
    }

    // Fetch all products from the database and perform search filter on paginated results
    async getAllProducts(query: PaginateQuery, search: string, userId: number) : Promise<Observable<Paginated<Product>>>{
        const user = await this.prisma.user.findUnique({
            where:{
                id:userId
            }
        })

        if(!user){
            throw new HttpException('Access to the resource denied',HttpStatus.FORBIDDEN)
        }else if(!user.isActive){
            throw new HttpException('Account blocked. Contact the admin to activate your account',HttpStatus.FORBIDDEN)
        }else{

            return from(
                this.prisma.$transaction([
                    this.prisma.product.findMany({
                        include:{
                            product_gallery:true
                        },
                        where: search !== undefined ? {
                            verfied:false,
                            OR:[
                                {
                                    product_title:{contains:search}
                                }
                            ]
                        }: {verfied:false},
    
                        skip:0,
                        take: query.limit || 10,
                        orderBy: {id:'desc'}
                    }),
    
                    this.prisma.product.count()
                ])
            ).pipe(map(([products, totalproducts]) =>{
                const productResults : Paginated<Product> = {
                    data: products,
                    links:{
                        first:query.path + `?limit=${query.limit}`,
                        previous:query.path + ``,
                        next:query.path + `?limit=${query.limit}&page=${query.page + 1}`,
                        last:query.path + `?limit=${query.limit}&page=${Math.ceil(totalproducts / query.limit)}`,
                        current: query.path + ``,
                    },
                    meta:{
                        totalItems:products.length,
                        totalPages:Math.ceil(totalproducts / query.limit),
                        searchBy:totalproducts['title'] || totalproducts['description'],
                        search: search
                    }
                }
                return productResults
            }))
        }
    }

    async getProductById(userId: number, productId:string){
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if(!user || !user.isActive)
            throw new ForbiddenException('Access denied to the requested resource')
        
        const product =  await this.prisma.product.findUnique({
            select:{
                id:true,
                product_title:true,
                slug:true,
                sku:true,
                product_qty:true,
                description:true,
                specification:true,
                selling_price:true,
                discount_price:true,
                category_id:true,
                product_gallery:true,
            },
            where:{
                id: productId
            }
        })

        if(!product){
            throw new HttpException('No product found', HttpStatus.NOT_FOUND)
        }else{
            return product
        }
    }

    /*
        -check if the user editing the product is present in the database and active
        -check if the product you are updating exist in the database
        -return updated product details
    */
    async editProduct(userId: number, productId:string, dto: UpdateProductDto){
        let user = await this.prisma.user.findUnique({
            where:{
                id: userId
            }
        })

        let product = await this.prisma.product.findUnique({
            
            where:{
                id:productId
            }
        })

        let slug = ''
        if(dto.product_title !== undefined){
             slug =slugify(dto.product_title,{
                replacement:'-',
                lower:true
            })
        }

        if(!user || !user.isActive || !user.is_admin){
            throw new HttpException('Acccess to the requested resource denied', HttpStatus.FORBIDDEN)
        }else if(!product){
            throw new HttpException('Product not found', HttpStatus.NOT_FOUND)
        }else{
            return await this.prisma.product.update({
                include:{
                    product_gallery:true
                },
                where:{
                    id:productId
                },
                data: dto.product_title !== undefined ?{
                    ...dto,
                    slug:slug
                } : {
                    ...dto,
                } 
            })
        }
    }

    async deleteProductById(userId: number, productId:string){
        let user= await this.prisma.user.findUnique({
            where:{
                id:userId
            }
        });

        let product = await this.prisma.product.findUnique({
            where:{id:productId}
        })

        if(!user || !user.isActive || !user.is_super_user){
            throw new HttpException('Acccess to the requested resource denied', HttpStatus.FORBIDDEN)
        }else if(!product){
            throw new HttpException('Delete operation failed. Product not found', HttpStatus.NOT_FOUND)
        }else{
            const delete_product = await this.prisma.product.delete({
                include:{
                    product_gallery:true
                },
                where:{
                    id:productId
                },
            })

            if(delete_product){
                return new HttpException(
                    product.product_title + ' was deleted successfully', HttpStatus.NO_CONTENT)
            }else{
                throw new HttpException('Delete operation failed', HttpStatus.FAILED_DEPENDENCY)
            }
        }
    }
}


