import { Decimal } from "@prisma/client/runtime"
import { IsDecimal, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class AddProductDto{
    @IsNotEmpty()
    @IsString()
    product_title: string

    @IsNotEmpty()
    // @IsNumber()
    product_qty: number 

    @IsNotEmpty()
    @IsDecimal()
    selling_price: number

    @IsNotEmpty()
    @IsDecimal()
    discount_price: number

    @IsNotEmpty()
    @IsString()
    description: string

    @IsNotEmpty()
    @IsString()
    specification: string

    @IsNotEmpty()
    @IsString()
    category_id: string
}