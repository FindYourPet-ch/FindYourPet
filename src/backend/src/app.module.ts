import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from './models/members/members.module';
import { AdvertsModule } from './models/adverts/adverts.module';
import { SpeciesModule } from './models/species/species.module';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './security/casl/casl.module';
import { FilesModule } from './models/files/files.module';

@Module({
  imports: [
    MembersModule,
    AdvertsModule,
    SpeciesModule,
    FilesModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'database/.env' }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(<string>process.env.POSTGRES_PORT),
      username: process.env.APP_DB_USER,
      password: process.env.APP_DB_PASS,
      database: process.env.APP_DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    CaslModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
