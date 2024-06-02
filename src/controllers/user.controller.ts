// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, post, requestBody} from '@loopback/rest';
import * as jwt from 'jsonwebtoken';
import {UserRepository} from '../repositories';
import {UserServices} from '../services/user.services';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('services.UserService') private userService: UserServices,
  ) {}

  @post('/users/register')
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            // required: ['userName', 'password'],
            properties: {
              userName: {type: 'string', minLength: 8},
              password: {type: 'string', minLength: 8},
            },
          },
        },
      },
    })
    newUserRequest: {
      userName: string;
      password: string;
    },
  ): Promise<Object> {
    try {
      const createdUser = await this.userService.registerUser(newUserRequest);

      return createdUser;
    } catch (error) {
      throw new HttpErrors.InternalServerError('Failed to create User');
    }
  }

  @post('users/login')
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['userName', 'password'],
            properties: {
              userName: {type: 'string'},
              password: {type: 'string'},
            },
          },
        },
      },
    })
    newUserRequest: {
      userName: string;
      password: string;
    },
  ): Promise<Object> {
    try {
      const login = await this.userService.login(newUserRequest);
      return login;
    } catch (error) {
      throw new HttpErrors.InternalServerError('Failed to login');
    }
  }

  @post('users/token')
  async verifyToken(
    @requestBody()
    newUserRequest: {
      token: string;
    },
  ): Promise<Object> {
    try {
      console.log(newUserRequest.token);
      const verify = jwt.verify(newUserRequest.token, 'accessTokenKey');
      return {
        status_Code: 200,
        verify: verify,
      };
    } catch (error) {
      throw new HttpErrors.InternalServerError('Failed to login');
    }
  }
}
