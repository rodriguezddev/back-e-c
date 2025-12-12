import { OmitType } from "@nestjs/swagger";
import { SignUpDto } from "./signUp.dto";
import { IsNotEmpty, IsString } from "class-validator";


export class SignInDto extends OmitType(SignUpDto,['email']){

    @IsString()
    @IsNotEmpty()
    username: string;
}