import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './UserResolver';
import { createConnection } from 'typeorm';
import { verify } from 'jsonwebtoken';
import { User } from './entity/User';
import {
  createAccessToken,
  sendRefreshToken,
  createRefreshToken
} from './auth';

(async () => {
  const app = express();

  app.use(cookieParser());

  app.get('/', (_req, res) => res.send('Hello'));

  app.post('/refresh_token', async (req, res) => {
    const token = req.cookies.jid;

    if (!token) {
      return res.send({ success: false, accessToken: '' });
    }

    try {
      const payload: any = verify(token, process.env.REFRESH_TOKEN_SECRET!);
      const user = await User.findOne({ id: payload.userId });

      if (!user || user.tokenVersion !== payload.tokenVersion) {
        return res.send({ success: false, accessToken: '' });
      }

      sendRefreshToken(res, createRefreshToken(user));

      return res.send({ success: true, accessToken: createAccessToken(user) });
    } catch (error) {
      console.error(error);
      return res.send({ success: false, accessToken: '' });
    }
  });

  try {
    await createConnection();
    console.log('Connected to DB 🤞');

    const graphQlServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [UserResolver]
      }),
      context({ req, res }) {
        return {
          req,
          res
        };
      }
    });

    graphQlServer.applyMiddleware({ app });
  } catch (error) {
    console.error('Server error 🤧', error);
  }

  app.listen(4000, () => {
    console.log('Server is running on port 4000 🚀');
  });
})();
