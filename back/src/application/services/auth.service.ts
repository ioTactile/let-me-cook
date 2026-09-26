import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { SessionPort } from '@/application/ports/session.port';
import { UserRepository } from '@/application/ports/user.repository';
import { AppError } from '@/domain/errors/app-error';

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly JWT_EXPIRES_IN = '7d';

  constructor(private readonly userRepository: UserRepository) {}

  async register(
    userData: {
      email: string;
      password: string;
      username: string;
    },
    session: SessionPort,
  ) {
    try {
      const existingUser = await this.userRepository.findByEmail(userData.email);

      if (existingUser) {
        throw new AppError('Un utilisateur avec cet email existe déjà', 400);
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await this.userRepository.create({
        ...userData,
        password: hashedPassword,
      });

      const token = this.generateToken(user.id);
      await session.create(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erreur lors de l'inscription", 500);
    }
  }

  async login(credentials: { email: string; password: string }, session: SessionPort) {
    try {
      const user = await this.userRepository.findByEmail(credentials.email);

      if (!user) {
        throw new AppError('Email ou mot de passe incorrect', 401);
      }

      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

      if (!isPasswordValid) {
        throw new AppError('Email ou mot de passe incorrect', 401);
      }

      const token = this.generateToken(user.id);
      await session.create(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erreur lors de la connexion', 500);
    }
  }

  async logout(session: SessionPort): Promise<void> {
    try {
      await session.destroy();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erreur lors de la déconnexion', 500);
    }
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  async getCurrentUser(userId: string) {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new AppError('Utilisateur non trouvé', 404);
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erreur lors de la récupération de l'utilisateur", 500);
    }
  }
}
