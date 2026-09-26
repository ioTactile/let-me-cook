import { AppError } from '@/domain/errors/app-error';

export function routeParam(value: string | string[] | undefined): string {
  if (value === undefined) {
    throw new AppError('Paramètre de route manquant', 400);
  }
  return Array.isArray(value) ? value[0] : value;
}
