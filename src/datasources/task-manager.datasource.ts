import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'TaskManager',
  connector: 'mysql',
  url: '',
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'TaskManager'
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class TaskManagerDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'TaskManager';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.TaskManager', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
