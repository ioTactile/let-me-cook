import { transformEmptyStringsToNull } from '@/utils/transform-empty-string-to-null';

describe('transformEmptyStringsToNull', () => {
  it('remplace les chaînes vides par null', () => {
    expect(
      transformEmptyStringsToNull({
        name: 'Tomate',
        description: '',
        quantity: 1,
      }),
    ).toEqual({
      name: 'Tomate',
      description: null,
      quantity: 1,
    });
  });

  it('conserve les valeurs non vides', () => {
    const input = { a: 'ok', b: 0, c: false as const };
    expect(transformEmptyStringsToNull(input)).toEqual(input);
  });
});
