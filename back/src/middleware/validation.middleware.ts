import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '@/domain/errors/app-error';

export const validateRequest = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(
      `Erreur de validation: ${errors
        .array()
        .map((err) => err.msg)
        .join(', ')}`,
      400,
    );
  }
  next();
};
