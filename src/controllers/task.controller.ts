// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  HttpErrors,
  Request,
  RestBindings,
  del,
  get,
  param,
  post,
  put,
  requestBody,
} from '@loopback/rest';
import * as jwt from 'jsonwebtoken';
import {Task} from '../models';
import {TaskRepository} from '../repositories';
import {TaskServices} from '../services/task.services';

// import {inject} from '@loopback/core';

export class TaskController {
  constructor(
    @repository(TaskRepository)
    public taskRepository: TaskRepository,
    @inject('services.TaskServices') private taskServices: TaskServices,
  ) {}

  @post('/createTask')
  async createTask(
    @requestBody()
    taskData: {
      title: string;
      content?: string;
      type: string;
      priority: string;
      startTime: string;
      endTime: string;
      userID: string;
    },
  ): Promise<Object> {
    try {
      const createdTask = await this.taskServices.createTask(taskData);
      return {
        status_code: 200,
        message: 'Task created successfully',
        data: createdTask,
      };
    } catch (error) {
      throw new HttpErrors.InternalServerError('Failed to create task');
    }
  }

  @put('/editTask/{id}')
  async editTask(
    @param.path.number('id') taskId: number,
    @requestBody() taskData: Partial<Task>,
  ): Promise<Object> {
    try {
      const updatedTask = await this.taskServices.editTask(taskId, taskData);
      return updatedTask;
    } catch (error) {
      return {
        status_code: 500,
        message: 'Cập nhật công việc không thành công',
      };
    }
  }

  @del('/deleteTask/{id}')
  async deleteTask(@param.path.number('id') taskId: number): Promise<Object> {
    try {
      const deleteTask = await this.taskServices.deleteTask(taskId);
      return deleteTask;
    } catch (error) {
      return {
        status_code: 500,
        message: 'Xoá công việc không thành công',
      };
    }
  }

  @get('/getTasks/{userID}')
  async getTaskByUserID(
    @param.path.number('userID') userID: number,
    @inject(RestBindings.Http.REQUEST) request: Request,
  ): Promise<Object> {
    try {
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new HttpErrors.Unauthorized('Token is missing');
      }
      const decoded = jwt.verify(token, 'accessTokenKey');
      console.log('verify', decoded);
      const getTasks = await this.taskServices.getTaskbyUserID(userID);
      return getTasks;
    } catch (error) {
      throw new HttpErrors.Unauthorized('Invalid token');
    }
  }

  @get('/filterTasks/{userID}')
  async getFilterTask(
    @param.path.number('userID') userID: number,
    @param.query.string('startDate') startDate?: string,
    @param.query.string('endDate') endDate?: string,
    @param.query.string('priority') priority?: string,
    @param.query.string('type') type?: string,
  ): Promise<Object> {
    console.log('start Date', startDate);
    console.log('end Date', endDate);
    console.log('priority', priority);
    console.log('type', type);

    const getTasks = await this.taskServices.getFilterTasks(userID, {
      startDate,
      endDate,
      priority,
      type,
    });
    return getTasks;
  }
}
