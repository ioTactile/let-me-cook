import { loginSchema } from '@/app/auth/_schemas/login';
import { createShoppingListSchema } from '@/app/shopping/_schemas/create-shopping-list';
import { Unit } from '@/types/enums';
import { queryKeys } from '@/lib/query-keys';

describe('loginSchema', () => {
  it('accepte un email et mot de passe valides', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'secret1',
    });
    expect(result.success).toBe(true);
  });

  it('rejette un email invalide', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret1',
    });
    expect(result.success).toBe(false);
  });
});

describe('createShoppingListSchema', () => {
  it('accepte une liste valide', () => {
    const result = createShoppingListSchema.safeParse({
      name: 'Courses',
      items: [
        {
          ingredientName: 'Lait',
          quantity: 1,
          unit: Unit.LITER,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejette une quantité nulle', () => {
    const result = createShoppingListSchema.safeParse({
      name: 'Courses',
      items: [
        {
          ingredientName: 'Lait',
          quantity: 0,
          unit: Unit.LITER,
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe('queryKeys', () => {
  it('préfixe correctement les clés frigo', () => {
    expect(queryKeys.fridge.lists()[0]).toBe('fridge');
    expect(queryKeys.fridge.detail('abc')).toEqual(['fridge', 'detail', 'abc']);
  });
});
