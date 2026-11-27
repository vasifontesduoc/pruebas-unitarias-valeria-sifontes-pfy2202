import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { ApolloProvider } from '@apollo/client/react';
import { crearClienteApollo } from '../graphql/cliente';
import AppRoutes from '../routes/AppRoutes';

// Renderiza la app completa en una ruta, con un cliente Apollo nuevo (caché vacía) en cada prueba
export function renderizarEnRuta(ruta = '/') {
  const usuario = userEvent.setup();
  const resultado = render(
    <ApolloProvider client={crearClienteApollo()}>
      <MemoryRouter initialEntries={[ruta]}>
        <AppRoutes />
      </MemoryRouter>
    </ApolloProvider>
  );
  return { usuario, ...resultado };
}

// Renderiza un componente suelto que usa enlaces (Link)
export function renderizarConRouter(componente) {
  const usuario = userEvent.setup();
  return { usuario, ...render(<MemoryRouter>{componente}</MemoryRouter>) };
}
