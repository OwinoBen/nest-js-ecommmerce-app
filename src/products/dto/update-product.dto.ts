import { IsBoolean, IsDecimal, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class UpdateProductDto{
    @IsOptional()
    @IsString()
    product_title?: string

    @IsOptional()
    // @IsNumber()
    product_qty?: number 

    @IsOptional()
    @IsDecimal()
    selling_price?: number

    @IsOptional()
    @IsDecimal()
    discount_price?: number

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsString()
    specification?: string

    @IsOptional()
    @IsString()
    category_id?: string

    @IsOptional()
    @IsBoolean()
    verfied?: boolean
}