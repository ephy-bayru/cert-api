import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { User } from './entities/user.entity';
import { UniqueUserValidationPipe } from './pipes/unique-user-validation.pipe';
import { UsersRepository } from './repository/users-repository';
import { UserMapper } from './dtos/user.mapper';
import { SeedService } from './services/seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    SeedService,
    UserMapper,
    UsersRepository,
    UniqueUserValidationPipe,
  ],
  exports: [UsersService, SeedService, UserMapper, UsersRepository],
})
export class UsersModule {}
