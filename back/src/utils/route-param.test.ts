import { AppError } from '@/domain/errors/app-error';
import { routeParam } from '@/utils/route-param';

describe('routeParam', () => {
  it('returns a string param', () => {
    expect(routeParam('abc')).toBe('abc');
  });

  it('returns the first element of an array', () => {
    expect(routeParam(['first', 'second'])).toBe('first');
  });

  it('throws AppError when undefined', () => {
    expect(() => routeParam(undefined)).toThrow(AppError);
    expect(() => routeParam(undefined)).toThrow('Paramètre de route manquant');
  });
});
