import { AuthGuard } from "@nestjs/passport";
import { Controller, Post, UseGuards, Request } from "@nestjs/common";

@Controller('auth')
export class AuthController {

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Request() request) {
    return {
      userId: request.user.id,
      token: '123'
    }
  }
}