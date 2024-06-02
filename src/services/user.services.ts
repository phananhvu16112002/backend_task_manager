import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserRepository} from '../repositories';

import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import {User} from '../models/user.model';

export class UserServices {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  async registerUser(newUserRequest: {
    userName: string;
    password: string;
  }): Promise<Object> {
    const existUser = await this.userRepository.findOne({
      where: {userName: newUserRequest.userName},
    });

    if (existUser) {
      if (existUser.active === false) {
        const hashedPassword = await bcrypt.hash(newUserRequest.password, 10);
        existUser.password = hashedPassword;
        existUser.active = true;
        const data = await this.userRepository.save(existUser);
        console.log('data', data);
        return {
          status_code: 200,
          message: 'Tạo tài khoản thành công',
          data: data,
        };
      } else {
        return {
          status_code: 422,
          message: 'Tài khoản đã được kích hoạt',
        };
      }
    } else {
      const hashedPassword = await bcrypt.hash(newUserRequest.password, 10);
      const newUser = new User({
        ...newUserRequest,
        password: hashedPassword,
        active: true,
      });
      const data = await this.userRepository.create(newUser);
      console.log('data2', data);
      return {
        status_code: 200,
        message: 'Tạo tài khoản thành công',
        data: data,
      };
    }
  }

  async login(userRequest: {
    userName: string;
    password: string;
  }): Promise<Object> {
    try {
      const existUser = await this.userRepository.findOne({
        where: {userName: userRequest.userName},
      });
      let error: string = '';
      if (!existUser) {
        error = 'Username không tồn tại';
        return {
          status_code: 422,
          message: error,
        };
      }
      const passwordMatch = await bcrypt.compare(
        userRequest.password,
        existUser.password,
      );
      if (!passwordMatch) {
        error = 'Mật khẩu không đúng';
        return {
          status_code: 422,
          message: error,
        };
      }

      const accessToken = jwt.sign(
        {
          userName: existUser.userName,
          userID: existUser.userID,
        },
        'accessTokenKey',
        {
          expiresIn: '30m',
        },
      );

      const refreshToken = jwt.sign(
        {
          userName: existUser.userName,
          userID: existUser.userID,
        },
        'refreshToken',
        {
          expiresIn: '8h',
        },
      );
      let data = {accessToken: accessToken, refreshToken: refreshToken};
      return {
        status_code: 200,
        message: 'Đăng nhập thành công',
        data: data,
      };
    } catch (error) {
      throw HttpErrors.BadRequest(error);
    }
  }
}
