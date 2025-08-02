import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigFactory } from './typeOrmConfig';
import { User } from './users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfigFactory(User)), UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
