import { formatearPrecio, formatearFecha, calcularNoches } from '../utils/formato';
import { normalizar } from '../utils/normalizar';

describe('utils/formato', () => {
  test('formatearPrecio agrega $ y separador de miles chileno', () => {
    expect(formatearPrecio(389990)).toBe('$389.990');
    expect(formatearPrecio(1149990)).toBe('$1.149.990');
  });

  test('formatearFecha muestra día, mes y año en español', () => {
    const texto = formatearFecha('2026-12-14');
    expect(texto).toMatch(/14/);
    expect(texto).toMatch(/dic/i);
    expect(texto).toMatch(/2026/);
  });

  test('calcularNoches cuenta las noches entre dos fechas', () => {
    expect(calcularNoches('2026-12-05', '2026-12-11')).toBe(6);
    expect(calcularNoches('2027-01-01', '2027-01-01')).toBe(0);
  });
});

describe('utils/normalizar', () => {
  test('quita tildes, pasa a minúsculas y elimina espacios', () => {
    expect(normalizar('  Perú ')).toBe('peru');
    expect(normalizar('CANCÚN')).toBe('cancun');
  });
});
