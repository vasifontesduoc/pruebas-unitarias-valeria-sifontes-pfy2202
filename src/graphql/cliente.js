import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

// Crea un cliente Apollo que envía las consultas GraphQL a /graphql (interceptado por MSW)
// y guarda las respuestas en su caché para no repetir consultas.
// Se usa la URL completa (origen + /graphql) para que funcione igual en el navegador y en las pruebas.
export function crearClienteApollo() {
  return new ApolloClient({
    link: new HttpLink({ uri: `${window.location.origin}/graphql` }),
    cache: new InMemoryCache(),
  });
}

// Cliente que usa la aplicación
export const clienteApollo = crearClienteApollo();
