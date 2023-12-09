import { DynamicModule, Module } from '@nestjs/common';
import { EtcdService } from './etcd.service';
import { Etcd3, IOptions } from 'etcd3';

export const ETCD_CLIENT_TOKEN = 'ETCD_CLIENT';

export const ETCD_CLIENT_OPTIONS_TOKEN = 'ETCD_CLIENT_OPTIONS';

export interface EtcdModuleAsyncOptions {
  useFactory?: (...args: any[]) => Promise<IOptions> | IOptions;
  inject?: any[];
}

@Module({})
export class EtcdModule {
  static forRoot(options?: IOptions): DynamicModule {
    return {
      module: EtcdModule,
      providers: [
        EtcdService,
        // 把传入的 options 作为一个 provider，然后再创建 etcd client 作为一个 provider
        {
          provide: ETCD_CLIENT_TOKEN,
          useFactory(options: IOptions) {
            const client = new Etcd3(options);
            return client;
          },
          inject: [ETCD_CLIENT_OPTIONS_TOKEN],
        },
        {
          provide: ETCD_CLIENT_OPTIONS_TOKEN,
          useValue: options,
        },
      ],
      exports: [EtcdService],
    };
  }

  static forRootAsync(options?: EtcdModuleAsyncOptions): DynamicModule {
    return {
      module: EtcdModule,
      providers: [
        EtcdService,
        // 把传入的 options 作为一个 provider，然后再创建 etcd client 作为一个 provider
        {
          provide: ETCD_CLIENT_TOKEN,
          useFactory(options: IOptions) {
            const client = new Etcd3(options);
            return client;
          },
          inject: [ETCD_CLIENT_OPTIONS_TOKEN],
        },
        {
          provide: ETCD_CLIENT_OPTIONS_TOKEN,
          // provider 是通过 useFactory 的方式创建的
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
      exports: [EtcdService],
    };
  }
}
