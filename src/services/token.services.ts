import {BindingScope, injectable} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import * as jwt from 'jsonwebtoken';

@injectable({scope: BindingScope.TRANSIENT})
export class TokenService {
  verifyToken(token: string, secretKey: string): Object {
    try {
      const decoded = jwt.verify(token, secretKey);
      return {
        status_code: 200,
        message: 'Token is valid',
        data: decoded,
      };
    } catch (error) {
      throw new HttpErrors.Unauthorized('Invalid token');
    }
  }
}
