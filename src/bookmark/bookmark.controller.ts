import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreatBookMarkDto, EditBookMarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
    constructor(private bookmarkService: BookmarkService){}

    @Get()
    getBookmarks(
        @GetUser('id') userId:number , 
        @Query('page') page: number=1, 
        @Query('limit') limit: number = 10, 
        @Query('search') search:string){
            limit = limit > 100 ? 100 : limit
            if(search === null || search === undefined){
                return this.bookmarkService.getBookmarks(userId)
            }else{
                return this.bookmarkService.getPaginatedBookmarks({page: Number(page), limit: Number(limit), path:'http://localhost:6000/bookmarks'},userId, search)
            }
    }

    @Get(':id')
    getBookById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) bookmarkId: number){
        return this.bookmarkService.getBookById(userId, bookmarkId)
    }

    @Post()
    createBookmark(@GetUser('id') userId:number, @Body() dto: CreatBookMarkDto){
        return this.bookmarkService.createBookmark(userId, dto)
    }


    @Patch(':id')
    editBookById(@GetUser('id') userId:number, @Body() dto:EditBookMarkDto,  @Param('id', ParseIntPipe) bookmarkId: number){
        return this.bookmarkService.editBookById(userId, bookmarkId, dto)
    }

    @HttpCode(HttpStatus.NO_CONTENT) //204
    @Delete(':id')
    deleteBookById(@GetUser('id') useriId:number, @Param('id', ParseIntPipe) bookmarkId: number){
        return this.bookmarkService.deleteBookById(useriId, bookmarkId)
    }
}
