import { Module } from '@nestjs/common';
import { AaaService } from './aaa.service';
import { AaaController } from './aaa.controller';
import { EtcdModule } from 'src/etcd/etcd.module';

@Module({
  imports: [
    // EtcdModule.forRoot({
    //   hosts: 'http://localhost:2379',
    //   auth: {
    //     username: 'root',
    //     password: 'james',
    //   },
    // }),
    EtcdModule.forRootAsync({
      async useFactory() {
        await 111;
        return {
          hosts: 'http://localhost:2379',
          auth: {
            username: 'root',
            password: 'james',
          },
        };
      },
    }),
  ],
  controllers: [AaaController],
  providers: [AaaService],
})
export class AaaModule {}
