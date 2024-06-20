import {Client, expect} from '@loopback/testlab';
import {TaskManagerApplication} from '../..';
import {setupApplication} from './test-helper';

describe('UserController', () => {
  let app: TaskManagerApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('registers a new user', async () => {
    const newUser = {
      userName: 'uniqueuser123',
      password: 'password123'
    };

    const res = await client
      .post('/users/register')
      .send(newUser)
      .expect(200);

    expect(res.body).to.containEql({message: 'Tạo tài khoản thành công'});
  });

  it('fails to register an existing user', async () => {
    const existingUser = {
      userName: 'testuser123',
      password: 'password123'
    };

    await client
      .post('/users/register')
      .send(existingUser)
      .expect(422)
      .then(res => {
        expect(res.body).to.containEql({message: 'Tài khoản đã được kích hoạt'});
      });
  });

  it('fails to register a user with short username or password', async () => {
    const invalidUser = {
      userName: 'short',
      password: 'short'
    };

    await client
      .post('/users/register')
      .send(invalidUser)
      .expect(422); // Expecting validation error
  });

  it('logs in a registered user', async () => {
    const newUser = {
      userName: 'testuser123',
      password: 'password123'
    };

    // Register the user first
    await client
      .post('/users/register')
      .send(newUser)
      .expect(200);

    // Now log in
    const res = await client
      .post('/users/login')
      .send(newUser)
      .expect(200);

    expect(res.body).to.have.property('data');
    expect(res.body.data).to.have.property('accessToken');
    expect(res.body.data).to.have.property('refreshToken');
  });

  it('fails to log in with incorrect credentials', async () => {
    const invalidLogin = {
      userName: 'nonexistentuser',
      password: 'wrongpassword'
    };

    await client
      .post('/users/login')
      .send(invalidLogin)
      .expect(422); // Expecting authentication error
  });

});
