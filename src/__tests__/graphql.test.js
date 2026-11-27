import { crearClienteApollo } from '../graphql/cliente';
import { VUELOS_Y_HOTELES, mensajeErrorGraphQL } from '../graphql/consultas';

describe('GraphQL (Apollo + mock MSW)', () => {
  test('la consulta VuelosYHoteles trae vuelos y hoteles del destino', async () => {
    const cliente = crearClienteApollo();
    const { data } = await cliente.query({ query: VUELOS_Y_HOTELES, variables: { destinoId: 'cusco' } });
    expect(data.vuelos.map((v) => v.codigo)).toEqual(['LA 2410', 'H2 4100']);
    expect(data.hoteles.map((h) => h.nombre)).toEqual(['Casona Inti', 'Hostal Piedras Andinas']);
  });

  test('un destino sin datos responde con un error GraphQL', async () => {
    const cliente = crearClienteApollo();
    await expect(
      cliente.query({ query: VUELOS_Y_HOTELES, variables: { destinoId: 'lima' } })
    ).rejects.toThrow('No hay vuelos ni hoteles para el destino "lima".');
  });
});

describe('mensajeErrorGraphQL', () => {
  test('usa los mensajes de graphQLErrors', () => {
    expect(mensajeErrorGraphQL({ graphQLErrors: [{ message: 'Uno.' }, { message: 'Dos.' }] })).toBe('Uno. Dos.');
  });

  test('usa los mensajes de errors (Apollo 4)', () => {
    expect(mensajeErrorGraphQL({ errors: [{ message: 'Servicio caído' }] })).toBe('Servicio caído');
  });

  test('sin errores GraphQL muestra un mensaje de conexión', () => {
    expect(mensajeErrorGraphQL(new Error('Failed to fetch'))).toMatch(/No se pudo conectar/);
  });
});
