import { ForbiddenException, HttpCode, HttpStatus, Injectable, UseGuards } from '@nestjs/common';
import { Category } from '@prisma/client';
import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { from, map, Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { AddCategoryDto, EditCategoryDto } from './dto';

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService){}

    async addCategory(created_by:number, dto: AddCategoryDto){
        return await this.prisma.category.create({
            data:{
                created_by,
                ...dto
            }
        })

    }

    getAllCategories(query: PaginateQuery, search:string) : Observable<Paginated<Category>>{
        return from(
            this.prisma.$transaction([
            this.prisma.category.findMany({
                where:search !== undefined?{
                    verified:true,
                    OR:[
                        {
                            name:{contains: search}
                        }
                    ]
                }:{
                    verified:true,
                },
                skip: 0,
                take: query.limit || 10,
                orderBy: {id:'desc'}
            }),

            this.prisma.category.count(),
        ])).pipe(
            map(([categories, totalcategories]) =>{
                const paginatedResults : Paginated<Category> = {
                    data: categories,
                    links: {
                        first:query.path + `?limit=${query.limit}`,
                        previous:query.path + ``,
                        next:query.path + `?limit=${query.limit}&page=${query.page + 1}`,
                        last:query.path + `?limit=${query.limit}&page=${Math.ceil(totalcategories / query.limit)}`,
                        current: query.path + ``,
                    },
                    meta:{
                        totalItems:categories.length,
                        totalPages:Math.ceil(totalcategories / query.limit),
                        // sortBy: [['id','DESC']],
                        searchBy:categories['title'] || categories['description'],
                        search: search
                    }
                }
                if(paginatedResults.data.length > 0)
                    delete paginatedResults.data[0].id
                    return paginatedResults;
            }) 
        )
    }

    async editCategory(userId:number, dto: EditCategoryDto, id: string){
        const user = await this.prisma.user.findUnique({
            where:{
                id: userId
            }
        });
        if(!user){
            throw new ForbiddenException('Something went wrong')
        }else if(user.is_admin != true || user.is_super_user != true){
            throw new ForbiddenException('You do not have permision to edit this category. Contact the system admin for more information')
        }else{
            //check if the category id is presentt
            const category_result = this.prisma.category.findUnique({
                where:{
                    category_id:id
                }
            })

            if(!category_result){
                throw new ForbiddenException('Category with the id not found')
            }

            return this.prisma.category.update({
                where:{
                    category_id: id,
                },
                data:{
                    ...dto
                }
            })
        }
        
    }

    async deleteCategoryById(userId: number, id:string){
        const user = await this.prisma.user.findUnique({
            where:{
                id: userId
            }
        });

        if(!user){
            throw new ForbiddenException('Something went wrong')
        }else if(user.is_admin != true || user.is_super_user != true){
            throw new ForbiddenException('Permision denied. Please contact the syetm admin')
        }else{
            const cate = await this.prisma.category.findUnique({
                where:{
                    category_id: id
                }
            })

            if(!cate){
                throw new ForbiddenException('Category not found')
            }else{
                
               const res =  await this.prisma.category.delete({
                    where:{
                        category_id:id
                    }
                })
                
                if(res){
                    throw new ForbiddenException({
                        statusCode:204,
                        message:"Category deleted successfully",
                        success: 1
                    })
                }else{
                    throw new ForbiddenException({
                        message:"Something went wrong",
                        success: 0
                    })
                }
            }
        }
    }
}
