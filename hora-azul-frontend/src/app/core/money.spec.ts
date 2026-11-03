import { SolesPipe, formatSoles } from './money';

describe('formatSoles', () => {
  it('usa el formato "S/. XX.00" con dos decimales', () => {
    expect(formatSoles(15)).toBe('S/. 15.00');
    expect(formatSoles(120.5)).toBe('S/. 120.50');
  });

  it('SolesPipe aplica el mismo formato', () => {
    expect(new SolesPipe().transform(17)).toBe('S/. 17.00');
  });
});
