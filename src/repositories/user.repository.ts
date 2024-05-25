import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {TaskManagerDataSource} from '../datasources';
import {User, UserRelations} from '../models';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.userID,
  UserRelations
> {
  tasks(id: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @inject('datasources.TaskManager') dataSource: TaskManagerDataSource,
  ) {
    super(User, dataSource);
  }
}
