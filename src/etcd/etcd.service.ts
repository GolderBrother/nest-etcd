import { Inject, Injectable } from '@nestjs/common';
import { Etcd3 } from 'etcd3';

@Injectable()
export class EtcdService {
  @Inject('ETCD_CLIENT')
  private client: Etcd3;

  async saveConfig(key: string, value: string | number | Buffer) {
    return await this.client.put(key).value(value);
  }

  async getConfig(key: string) {
    return await this.client.get(key).string();
  }

  async delConfig(key: string) {
    return await this.client.delete().key(key);
  }

  /**
   * 服务注册
   * @param serviceName
   * @param instanceId
   * @param metadata
   */
  async registerService(
    serviceName: string,
    instanceId: string,
    metadata: Record<number, any>,
  ) {
    const key = `/services/${serviceName}/${instanceId}`;
    const lease = this.client.lease(10);
    await lease.put(key).value(JSON.stringify(metadata));
    lease.on('lost', async () => {
      console.log('租约过期，重新注册...');
      await this.registerService(serviceName, instanceId, metadata);
    });
  }

  // 服务发现
  async discoverService(serviceName: string) {
    const instances = await this.client
      .getAll()
      .prefix(`/services/${serviceName}`)
      .strings();
    return Object.entries(instances).map(([key, value]) => JSON.parse(value));
  }

  // 监听服务变更
  async watchService(serviceName: string, callback) {
    const watcher = await this.client
      .watch()
      .prefix(`/services/${serviceName}`)
      .create();
    watcher.on('put', async (event) => {
      console.log('新的服务节点添加:', event.key.toString());
      const services = this.discoverService(serviceName);
      callback(services);
    });
    watcher.on('delete', async (event) => {
      console.log('服务节点删除:', event.key.toString());
      const services = this.discoverService(serviceName);
      callback(services);
    });
  }
}
