import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
  Int
} from 'type-graphql';
import { hash, compare } from 'bcryptjs';
import { Context } from './context';
import { User } from './entity/User';
import {
  createAccessToken,
  createRefreshToken,
  isAuth,
  sendRefreshToken
} from './auth';
import { getConnection } from 'typeorm';

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
  error?: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  @UseMiddleware(isAuth)
  hello(@Ctx() { payload }: Context) {
    return `Hello ${payload.userId} form graphQL 🌏`;
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => Boolean)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string
  ) {
    const hashedPassword = await hash(password, 12);

    try {
      await User.insert({
        email,
        password: hashedPassword
      });

      return true;
    } catch {
      return false;
    }
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: Context
  ): Promise<LoginResponse> {
    const currentUser = await User.findOne({ where: { email } });

    if (!currentUser) {
      throw new Error('User doesnt exist');
    }

    const isValidPassword = await compare(password, currentUser.password);

    if (!isValidPassword) {
      throw new Error('Email or password are wrong');
    }

    sendRefreshToken(res, createRefreshToken(currentUser));

    return {
      accessToken: createAccessToken(currentUser)
    };
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokens(@Arg('userId', () => Int) userId: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, 'tokenVersion', 1);

    return true;
  }
}
