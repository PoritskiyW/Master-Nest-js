import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Body, Controller } from '@nestjs/common';

import { User } from './user.entity';
import { AuthService } from './auth.service';
import { CreateUserDto } from './input/create.user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(@Body() createUserDto: CreateUserDto) {
    const user = new User();

    if (createUserDto.password !== createUserDto.retypedPassword) {
      throw new BadRequestException(['Passwords are not identical']);
    }

    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      throw new BadRequestException(['Username or email is already taken']);
    }

    user.username = createUserDto.username;
    user.email = createUserDto.email;
    user.password = await this.authService.hashPassword(createUserDto.password);
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;

    return {
      ...(await this.userRepository.save(user)),
      token: this.authService.getTokenForUser(user),
    };
  }
}
