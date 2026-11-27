import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Servidor MSW para Node: lo usan las pruebas (Jest) con los mismos handlers que el navegador
export const server = setupServer(...handlers);
