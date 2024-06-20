import {Client, expect} from '@loopback/testlab';
import {TaskManagerApplication} from '../..';
import {setupApplication} from './test-helper';

describe('TaskController', () => {
  let app: TaskManagerApplication;
  let client: Client;
  let token: string;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  before(async () => {
    // Register a user and log in to get a token
    await client.post('/users/register').send({
      userName: 'testuser123',
      password: 'testpassword',
    });

    const response = await client.post('/users/login').send({
      userName: 'testuser123',
      password: 'testpassword',
    });

    token = response.body.data.accessToken;
  });

  it('creates a new task', async () => {
    const taskData = {
      title: 'Test Task',
      content: 'This is a test task',
      type: 'Todo',
      priority: 'High',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(), // +1 day
      userID: '1',
    };

    const response = await client
      .post('/createTask')
      .set('Authorization', `Bearer ${token}`)
      .send(taskData)
      .expect(200);

    expect(response.body).to.have.property('status_code', 200);
    expect(response.body.data).to.have.properties(['title', 'content', 'type', 'priority', 'startTime', 'endTime', 'userID']);
  });

  it('fails to create a task without authentication', async () => {
    const taskData = {
      title: 'Test Task',
      content: 'This is a test task',
      type: 'Todo',
      priority: 'High',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(),
      userID: '1',
    };

    await client.post('/createTask').send(taskData).expect(401);
  });

  it('edits an existing task', async () => {
    const taskData = {
      title: 'Test Task',
      content: 'This is a test task',
      type: 'Todo',
      priority: 'High',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(),
      userID: '1',
    };

    const createResponse = await client
      .post('/createTask')
      .set('Authorization', `Bearer ${token}`)
      .send(taskData);

    const taskId = createResponse.body.data.id;

    const updatedTaskData = {
      title: 'Updated Test Task',
      content: 'This is an updated test task',
      type: 'In Progress',
      priority: 'Medium',
    };

    const editResponse = await client
      .put(`/editTask/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedTaskData)
      .expect(200);

    expect(editResponse.body).to.have.property('status_code', 200);
    expect(editResponse.body.data).to.have.properties(['title', 'content', 'type', 'priority']);
    expect(editResponse.body.data.title).to.equal('Updated Test Task');
  });

  it('deletes an existing task', async () => {
    const taskData = {
      title: 'Test Task',
      content: 'This is a test task',
      type: 'Todo',
      priority: 'High',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(),
      userID: '1',
    };

    const createResponse = await client
      .post('/createTask')
      .set('Authorization', `Bearer ${token}`)
      .send(taskData);

    const taskId = createResponse.body.data.id;

    const deleteResponse = await client
      .del(`/deleteTask/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(deleteResponse.body).to.have.property('status_code', 200);
    expect(deleteResponse.body.message).to.equal('Xoá thành công');
  });

  it('retrieves tasks by user ID', async () => {
    const response = await client
      .get('/getTasks/1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).to.have.property('status_code', 200);
    expect(response.body.data).to.have.properties(['todo', 'progress', 'done']);
  });

  it('filters tasks by criteria', async () => {
    const response = await client
      .get('/filterTasks/1')
      .set('Authorization', `Bearer ${token}`)
      .query({
        startDate: new Date().toISOString(),
        priority: 'High',
      })
      .expect(200);

    expect(response.body).to.have.property('status_code', 200);
    expect(response.body.data).to.be.an.Array();
  });
});

