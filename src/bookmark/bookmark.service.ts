import { ForbiddenException, Injectable, Query } from '@nestjs/common';
import { Bookmark } from '@prisma/client';
import { Paginate, PaginateQuery, paginate, Paginated } from 'nestjs-paginate'
import { from, map, Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreatBookMarkDto, EditBookMarkDto } from './dto';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService){}
    getBookmarks(userId:number){
        return this.prisma.bookmark.findMany({
            where:{
                userId,
            }
        })
    }
    

    getPaginatedBookmarks(query:PaginateQuery, userId:number, search: string) : Observable<Paginated<Bookmark>>{
        return from(this.prisma.$transaction([
            this.prisma.bookmark.findMany({
                where:{
                    userId:userId,
                    OR:[
                        {
                            title:{contains:search},
                        },
                        {
                            description:{contains:search}
                        }

                    ]
                },
                skip:0,
                take: query.limit || 10,
                orderBy:{id:"desc"},
                // select:{title:true,description:true,id:true}
            }),
            this.prisma.bookmark.count()
        ])
            ).pipe(
            map(([bookmarks, totalbookmarks]) => {
                
                const paginatedResults: Paginated<Bookmark> = {
                    data : bookmarks,
                    links:{
                        first:query.path + `?limit=${query.limit}`,
                        previous:query.path + ``,
                        next:query.path + `?limit=${query.limit}&page=${query.page + 1}`,
                        last:query.path + `?limit=${query.limit}&page=${Math.ceil(totalbookmarks / query.limit)}`,
                        current: query.path + ``,
                    },
                    meta:{
                        // currentPage: query.page,
                        totalItems:bookmarks.length,
                        // itemsPerPage:query.limit,
                        totalPages:Math.ceil(totalbookmarks / query.limit),
                        sortBy: [['id','DESC']],
                        searchBy:bookmarks['title'] || bookmarks['description'],
                        search: search
                    }
                }

                return paginatedResults
            })
        )
    }

    getBookById(userId:number, bookmarkId:number){
        return this.prisma.bookmark.findFirst({
            where:{
                id:bookmarkId,
                userId,
            }
        })
    }

    async createBookmark(userId:number, dto:CreatBookMarkDto){
        const bookmark = await this.prisma.bookmark.create({
            data:{
                userId,
                ...dto,
            }
        })
        return bookmark
    }


    async editBookById(userId:number, bookmarkId:number, dto:EditBookMarkDto){
        //get bookmark by id
      const bookmark = await this.prisma.bookmark.findUnique({
        where:{
            id:bookmarkId
        }
      });

      //check if user owns the bookmark
      if(!bookmark || bookmark.userId !== userId){
        throw new ForbiddenException('Access to resource denied')
      }

      return this.prisma.bookmark.update({
        where:{
            id:bookmarkId
        },
        data:{
            ...dto
        }
      })

    }

    async deleteBookById(userId:number, bookmarkId:number){
         //get bookmark by id
      const bookmark = await this.prisma.bookmark.findUnique({
        where:{
            id:bookmarkId
        }
      });

      //check if user owns the bookmark
      if(!bookmark || bookmark.userId !== userId){
        throw new ForbiddenException('Access to resource denied')
      }

      await this.prisma.bookmark.delete({
        where:{
            id:bookmarkId
        }
      })
    }
}
