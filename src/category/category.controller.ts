import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query, UseGuards, Version } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { CategoryService } from './category.service';
import { AddCategoryDto, EditCategoryDto } from './dto';

@UseGuards(JwtGuard)
@Controller('category')
export class CategoryController {
    constructor(private categoryService: CategoryService){}

    @Version('1')
    @Post('add')
    addCategory(@GetUser('id') createdBy: number, @Body() dto: AddCategoryDto){
        return this.categoryService.addCategory(createdBy, dto)
    }

    @Version('1')
    @Get()
    getAllCategories(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string
     ){
        limit = limit > 100 ? 100 : limit
       
        return this.categoryService.getAllCategories({page: Number(page), limit: Number(limit), path: 'http://localhost:6000/category'}, search)
    }

    @Version('1')
    @Patch('edit/:id')
    
    editCategory(@GetUser('id') userId:number, @Body() dto: EditCategoryDto, @Param('id', ParseUUIDPipe) category_id: string){
        return this.categoryService.editCategory(userId, dto, category_id)
    }

    @HttpCode(HttpStatus.NO_CONTENT) //204
    @Version('1')
    @Delete('remove/:id')
    removeCategoryById(@GetUser('id') userId:number, @Param('id', ParseUUIDPipe) category_id: string){
        
        return this.categoryService.deleteCategoryById(userId,category_id)
    }
}
