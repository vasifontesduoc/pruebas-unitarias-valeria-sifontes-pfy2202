// Se ejecuta antes de cada archivo de pruebas
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { server } from './src/mocks/server';
import { limpiarCache } from './src/services/api';

// Los mocks responden con un pequeño retraso (como un servidor real),
// así que las búsquedas asíncronas esperan hasta 5 segundos
configure({ asyncUtilTimeout: 5000 });

// MSW intercepta todas las peticiones REST y GraphQL durante las pruebas
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Después de cada prueba: se quitan los handlers agregados en esa prueba y se vacía la caché REST
afterEach(() => {
  server.resetHandlers();
  limpiarCache();
});

afterAll(() => server.close());
