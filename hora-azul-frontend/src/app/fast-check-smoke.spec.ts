import * as fc from 'fast-check';

// Smoke test para verificar que fast-check está disponible y funciona
describe('fast-check setup', () => {
  it('should be importable and work correctly', () => {
    // Property: la suma de dos enteros positivos es mayor que cada uno individualmente
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1, max: 1000 }),
        (a, b) => a + b > a && a + b > b,
      ),
    );
  });

  it('should be able to generate arrays', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        return Array.isArray(arr);
      }),
    );
  });
});
