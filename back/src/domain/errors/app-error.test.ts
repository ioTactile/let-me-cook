import { AppError } from '@/domain/errors/app-error';

describe('AppError', () => {
  it('sets message, statusCode and name', () => {
    const error = new AppError('Not found', 404);
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('AppError');
    expect(error).toBeInstanceOf(Error);
  });
});
