import { User } from './entity/User';
import { sign, verify } from 'jsonwebtoken';
import { MiddlewareFn } from 'type-graphql';
import { Context } from './context';
import { Response } from 'express';

export const createAccessToken = (user: User) =>
  sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: '1m'
  });

export const createRefreshToken = (user: User) =>
  sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: '7d'
    }
  );

export const isAuth: MiddlewareFn<Context> = ({ context }, next) => {
  const authorization = context.req.headers['authorization'];
  if (!authorization) {
    throw new Error('Please Log In or Register');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    context.payload = payload as any;
  } catch (error) {
    console.error(error);
  }

  return next();
};

export const sendRefreshToken = (res: Response, token: string) =>
  res.cookie('jid', token, { httpOnly: true });
