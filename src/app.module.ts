import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Etcd3 } from 'etcd3';
import { EtcdModule } from './etcd/etcd.module';
import { AaaModule } from './aaa/aaa.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    EtcdModule,
    AaaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/.env',
    }),
    EtcdModule.forRootAsync({
      async useFactory(configService: ConfigService) {
        await 111;
        return {
          // 从配置文件读取连接信息
          hosts: configService.get('etcd_hosts') ?? 'http://localhost:2379',
          auth: {
            username: configService.get('etcd_auth_username') ?? 'root',
            password: configService.get('etcd_auth_password') ?? 'james',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: 'ETCD_CLIENT',
    //   useFactory() {
    //     const etcd3 = new Etcd3({
    //       hosts: 'http://localhost:2379',
    //       auth: {
    //         username: 'root',
    //         password: 'james',
    //       },
    //     });
    //     return etcd3;
    //   },
    // },
  ],
})
export class AppModule {}
