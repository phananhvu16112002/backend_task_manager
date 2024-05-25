import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {TaskManagerDataSource} from '../datasources';
import {Task, TaskRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class TaskRepository extends DefaultCrudRepository<
  Task,
  typeof Task.prototype.taskID,
  TaskRelations
> {

  public readonly user: BelongsToAccessor<User, typeof Task.prototype.taskID>;

  constructor(
    @inject('datasources.TaskManager') dataSource: TaskManagerDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Task, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
