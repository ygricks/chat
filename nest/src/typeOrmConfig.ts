import { ConfigModule } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

ConfigModule.forRoot();

export function typeOrmConfigFactory(...ents): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5400', 10),
    username: process.env.DB_USER || '_POST_',
    password: process.env.DB_PASS || '_PASS_',
    database: process.env.DB_NAME || '_DB_',
    entities: ents,
    synchronize: false,
    logging: false,
  };
}
