import { INestApplication, ValidationPipe } from '@nestjs/common'
import {Test} from '@nestjs/testing'
import * as pactum from 'pactum'
import { PrismaService } from '../src/prisma/prisma.service'
import { AppModule } from '../src/app.module'
import { AuthDto } from 'src/auth/dto'
import { EditUserDto } from 'src/user/dto'
import { CreatBookMarkDto } from 'src/bookmark/dto'
describe('App e2e', ()=>{
  let app: INestApplication
  let prisma: PrismaService
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports:[AppModule]
    }).compile()
    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe(
      {
        whitelist:true //prevent sql injections
      }
    ))
    await app.init()
    await app.listen(3333)

    prisma = app.get(PrismaService)

    await prisma.cleanDB()
    pactum.request.setBaseUrl('http:localhost:3333')
  })
  afterAll(()=>{
    app.close()
  })
  
  describe('Auth', ()=>{
    const dto: AuthDto = {
      email: 'owinoben2023@gmail.com',
      password: '1234',
      firstname:'Benson',
      lastname:'opondo'

    }
    describe('Signup',()=>{
      it('should throw email error when empty', () => {
        return pactum.spec().post('/auth/signup').withBody({password:dto.password}).expectStatus(400)
      })
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400)
      })
      it('should throw password error when empty', () => {
        return pactum.spec().post('/auth/signup').withBody({email:dto.password}).expectStatus(400)
      })
      it('should sign', () =>{
        return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201)
      })
    })

    describe('Signin', ()=>{
      it('should throw email error when empty', () => {
        return pactum.spec().post('/auth/signin').withBody({password:dto.password}).expectStatus(400)
      })
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400)
      })
      it('should throw password error when empty', () => {
        return pactum.spec().post('/auth/signin').withBody({email:dto.password}).expectStatus(400)
      })

      it('should signIn', () => {
        return pactum.spec().post('/auth/signin').withBody(dto).expectStatus(200).stores('userAt','access_token')
      })
    })
  })

  describe('Users', ()=>{
    describe('Get user', ()=>{
      it('should get current user', ()=>{
        return pactum.spec().get('/users/profile').withHeaders({
          Authorization: 'Bearer $S{userAt  }'
        }).expectStatus(200).inspect()
      })
    })

    describe('Edit user', ()=>{
      
      it('should get update user', ()=>{
        const dto: EditUserDto = {
          firstname:'Benson',
          lastname:'Opondo',
          email:'opondoben@gmail.com'
        }
        return pactum.spec().patch('/users/update').withHeaders({
          Authorization: 'Bearer $S{userAt  }'
        }).withBody(dto).expectStatus(200).inspect().expectBodyContains(dto.email)
      })
    })
  })

  describe('Bookmarks', ()=>{
    describe('Create bookmarks',()=>{
      const dto: CreatBookMarkDto = {
        title:"My first bookmark title",
        link: "https://www.youtube.com/watch?v=GHTA143_b-s"
      }

      it("should create bookmark",() =>{
        return pactum.spec().post('/bookmarks').withHeaders({
          Authorization: 'Bearer $S{userAt}'
        }).withBody(dto).expectStatus(201).stores('bookmarkId', 'id').inspect()
      })

    })
    describe('Get bookmarks', ()=>{
      it('should get bookmarks', ()=>{
        return pactum.spec().get('/bookmarks/').withHeaders({
          Authorization: 'Bearer $S{userAt}'
        }).expectStatus(200)
      })
    })

    describe('Get bookmarks by id', ()=>{
      it('should get bookmarks by id', ()=>{
        return pactum.spec().get('/bookmarks/{id}').withPathParams('id', '$S{bookmarkId}').withHeaders({
          Authorization: 'Bearer $S{userAt}'
        }).expectStatus(200).inspect()
      })
    })
    describe('Edit bookmarks', ()=>{
      const dto: CreatBookMarkDto = {
        title:"My first bookmark edited title",
        description:"This is the description",
        link: "https://www.youtube.com/watch?v=GHTA143_b-s"
      }

      it("should edit bookmark by id",() =>{
        return pactum.spec().patch('/bookmarks/{id}').withPathParams('id', '$S{bookmarkId}').withHeaders({
          Authorization: 'Bearer $S{userAt}'
        }).withBody(dto).expectStatus(200).stores('bookmarkId', 'id').inspect()
      })
    })

    describe('Delete bookmark', ()=>{
      it("should delete bookmark by id",() =>{
        return pactum.spec().delete('/bookmarks/{id}').withPathParams('id', '$S{bookmarkId}').withHeaders({
          Authorization: 'Bearer $S{userAt}'
        }).expectStatus(204).stores('bookmarkId', 'id').inspect()
      })

      it('should get empty bookmarks', ()=>{
        return pactum.spec().get('/bookmarks/').withHeaders({
          Authorization: 'Bearer $S{userAt}'
        }).expectStatus(200).expectJsonLength(0)
      })
    })
  })
})