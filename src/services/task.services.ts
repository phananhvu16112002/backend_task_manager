import {repository} from '@loopback/repository';
import {Task} from '../models';
import {TaskRepository, UserRepository} from '../repositories';

export class TaskServices {
  constructor(
    @repository(TaskRepository)
    public taskRepository: TaskRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  async createTask(taskData: {
    title: string;
    content?: string;
    type: string;
    priority: string;
    startTime: string;
    endTime: string;
    userID: string;
  }): Promise<Task | null> {
    const task = new Task({...taskData, dateCreated: new Date().toISOString()});
    return this.taskRepository.create(task);
  }

  async editTask(taskId: number, taskData: Partial<Task>): Promise<Object> {
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      return {
        status_code: 422,
        message: 'Công việc không tồn tại',
      };
    }
    Object.assign(existingTask, taskData, {
      dateUpdated: new Date().toISOString(),
    });
    await this.taskRepository.updateById(taskId, existingTask);
    const result = await this.taskRepository.findById(taskId);
    return {
      status_code: 200,
      message: 'Chỉnh sửa công việc thành công',
      data: result,
    };
  }

  async deleteTask(taskId: number): Promise<Object> {
    const existingTask = await this.taskRepository.findById(taskId);
    if (!existingTask) {
      return {
        status_code: 422,
        message: 'Công việc không tồn tại',
      };
    }
    await this.taskRepository.deleteById(taskId);
    return {
      status_code: 200,
      message: 'Xoá thành công',
    };
  }

  // async getTaskbyUserID(userID: number): Promise<object> {
  //     // Kiểm tra xem user có tồn tại không
  //     // const checkUser = await this.userRepository.findById(userID.toString().trim());
  //     // if (!checkUser) {
  //     //     return {
  //     //         status_code: 422,
  //     //         message: 'User không tồn tại',
  //     //     };
  //     // }

  //     const tasks = await this.taskRepository.find({where: {userId: userID}});
  //     const categorizedTasks = {
  //         todo: tasks.filter(task => task.type === 'Todo'),
  //         progress: tasks.filter(task => task.type === 'In Progress'),
  //         done: tasks.filter(task => task.type === 'Done'),
  //     };

  //     return {
  //         status_code: 200,
  //         message: `Danh sách công việc của ${userID}`,
  //         data: categorizedTasks,
  //     };
  // }

  async getTaskbyUserID(userID: number): Promise<object> {
    const checkUser = await this.userRepository.findById(userID.toString());
    if (!checkUser) {
      console.log(`User with ID ${userID} not found.`);
      return {
        status_code: 422,
        message: 'User không tồn tại',
      };
    }

    const tasks = await this.taskRepository.find({where: {userId: userID}});
    const currentWeekTasks = this.filterTasksForCurrentWeek(tasks);

    const categorizedTasks = {
      todo: currentWeekTasks.filter(task => task.type === 'Todo'),
      progress: currentWeekTasks.filter(task => task.type === 'In Progress'),
      done: currentWeekTasks.filter(task => task.type === 'Done'),
    };

    return {
      status_code: 200,
      message: `Danh sách công việc của ${userID}`,
      data: categorizedTasks,
    };
  }

  private filterTasksForCurrentWeek(tasks: Task[]): Task[] {
    const now = new Date();
    const startOfWeek = this.getStartOfWeek(now);
    const endOfWeek = this.getEndOfWeek(now);

    return tasks.filter(task => {
      const taskDate = new Date(task.startTime); // Giả định startTime là ngày của nhiệm vụ
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    });
  }

  private getStartOfWeek(date: Date): Date {
    const startOfWeek = new Date(date);
    console.log(startOfWeek);
    const day = startOfWeek.getDay();
    console.log(day);

    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    console.log(diff);

    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  private getEndOfWeek(date: Date): Date {
    const endOfWeek = new Date(this.getStartOfWeek(date));
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  }

  async getFilterTasks(
    userId: number,
    filters: {
      startDate?: string;
      endDate?: string;
      priority?: string;
      type?: string;
    },
  ): Promise<Object> {
    const checkUser = await this.userRepository.findById(userId.toString());
    if (!checkUser) {
      return {
        status_code: 422,
        message: 'User không tồn tại',
      };
    }

    let filterConditions: any = {userId: userId};

    if (filters.startDate) {
      filterConditions.startTime = {
        gte: new Date(filters.startDate).toISOString(),
      };
      console.log('asd', new Date(filters.startDate).toISOString());
    }
    if (filters.endDate) {
      filterConditions.endTime = {lt: new Date(filters.endDate).toISOString()};
    }
    if (filters.priority) {
      filterConditions.priority = filters.priority;
    }
    if (filters.type) {
      filterConditions.type = filters.type;
    }
    const tasks = await this.taskRepository.find({where: filterConditions});
    return {
      status_code: 200,
      message: 'Lấy danh sách công việc thành công',
      data: tasks,
    };
  }
}
