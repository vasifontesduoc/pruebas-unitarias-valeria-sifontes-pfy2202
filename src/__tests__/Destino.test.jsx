import { screen, within } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { renderizarEnRuta } from '../test/renderizar';

// Espera a que carguen el destino (REST) y los vuelos y hoteles (GraphQL)
async function abrirDestino(id) {
  const resultado = renderizarEnRuta(`/destinos/${id}`);
  await screen.findByRole('heading', { level: 1 });
  await screen.findByRole('heading', { name: /Vuelos/ });
  return resultado;
}

describe('Página Destino (REST + GraphQL)', () => {
  test('muestra el destino con sus actividades, vuelos y hoteles', async () => {
    renderizarEnRuta('/destinos/cusco');

    expect(await screen.findByText('Cargando destino...')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 1, name: /Cusco/ })).toBeInTheDocument();
    expect(screen.getByText('Excursión a Machu Picchu')).toBeInTheDocument();

    expect(await screen.findByRole('button', { name: /LA 2410/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Casona Inti/ })).toBeInTheDocument();
  });

  test('las opciones sin cupo aparecen deshabilitadas', async () => {
    await abrirDestino('cusco');

    expect(screen.getByRole('button', { name: /H2 4100/ })).toBeDisabled();
    expect(screen.getByText('Vuelo agotado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hostal Piedras Andinas/ })).toBeDisabled();
    expect(screen.getByText('Hotel completo')).toBeInTheDocument();
  });

  test('al elegir vuelo y hotel calcula el total del viaje', async () => {
    const { usuario } = await abrirDestino('cusco');

    await usuario.click(screen.getByRole('button', { name: /LA 2410/ }));
    await usuario.click(screen.getByRole('button', { name: /Casona Inti/ }));

    const resumen = screen.getByRole('complementary', { name: 'Resumen del viaje' });
    // 1 pasajero × $449.990 + 6 noches × $69.990 = $869.930
    expect(within(resumen).getByText('$869.930')).toBeInTheDocument();
    expect(within(resumen).getByText('¡Tu viaje está listo para reservar!', { exact: false })).toBeInTheDocument();

    await usuario.click(within(resumen).getByRole('button', { name: 'Limpiar selección' }));
    expect(within(resumen).getByText('Elige un vuelo')).toBeInTheDocument();
  });

  test('hacer clic de nuevo en un vuelo lo deselecciona', async () => {
    const { usuario } = await abrirDestino('cusco');
    const tarjeta = screen.getByRole('button', { name: /LA 2410/ });

    await usuario.click(tarjeta);
    expect(tarjeta).toHaveAttribute('aria-pressed', 'true');
    await usuario.click(tarjeta);
    expect(tarjeta).toHaveAttribute('aria-pressed', 'false');
  });

  test('con más pasajeros que asientos el vuelo se deshabilita y se quita de la selección', async () => {
    const { usuario } = await abrirDestino('cancun');

    await usuario.click(screen.getByRole('button', { name: /LA 8120/ })); // tiene 3 asientos
    await usuario.selectOptions(screen.getByRole('combobox', { name: /Pasajeros/ }), '4');

    expect(screen.getByRole('button', { name: /LA 8120/ })).toBeDisabled();
    expect(screen.getByText('No alcanza para 4 pasajeros')).toBeInTheDocument();
    expect(screen.getByText('Elige un vuelo')).toBeInTheDocument();
  });

  test('un hotel fuera de las fechas del vuelo no se puede elegir', async () => {
    const { usuario } = await abrirDestino('buenos-aires');

    await usuario.click(screen.getByRole('button', { name: /AR 1281/ })); // 18 al 22 de diciembre

    expect(screen.getByRole('button', { name: /Casa San Telmo/ })).toBeDisabled();
    expect(screen.getByText('No disponible para las fechas de tu vuelo')).toBeInTheDocument();
  });

  test('"Mostrar solo opciones disponibles" oculta lo que no se puede elegir', async () => {
    const { usuario } = await abrirDestino('cusco');

    await usuario.click(screen.getByRole('checkbox', { name: /Mostrar solo opciones disponibles/ }));

    expect(screen.queryByRole('button', { name: /H2 4100/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Hostal Piedras Andinas/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /LA 2410/ })).toBeInTheDocument();
  });

  test('el filtro también considera la cantidad de pasajeros', async () => {
    const { usuario } = await abrirDestino('cancun');

    await usuario.selectOptions(screen.getByRole('combobox', { name: /Pasajeros/ }), '4');
    await usuario.click(screen.getByRole('checkbox', { name: /Mostrar solo opciones disponibles/ }));

    expect(screen.queryByRole('button', { name: /LA 8120/ })).not.toBeInTheDocument(); // 3 asientos
    expect(screen.getByRole('button', { name: /AM 15/ })).toBeInTheDocument(); // 9 asientos
  });

  test('un destino sin vuelos muestra un mensaje', async () => {
    await abrirDestino('san-pedro-de-atacama');

    expect(screen.getByText('No hay vuelos disponibles')).toBeInTheDocument();
    expect(screen.getByText('Por ahora no tenemos vuelos hacia San Pedro de Atacama.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lodge Cielo Estrellado/ })).toBeInTheDocument();
  });

  test('un destino que no existe muestra el error 404 del mock REST', async () => {
    renderizarEnRuta('/destinos/lima');

    expect(await screen.findByRole('heading', { name: 'Destino no encontrado' })).toBeInTheDocument();
    expect(screen.getByText('El destino "lima" no existe.')).toBeInTheDocument();
  });

  test('si GraphQL falla muestra el error y al reintentar carga los vuelos', async () => {
    server.use(
      graphql.query('VuelosYHoteles', () => HttpResponse.json({ errors: [{ message: 'Servicio de vuelos caído' }] }))
    );
    const { usuario } = renderizarEnRuta('/destinos/cusco');

    expect(await screen.findByText('Servicio de vuelos caído')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No pudimos cargar vuelos y hoteles' })).toBeInTheDocument();

    server.resetHandlers();
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('button', { name: /LA 2410/ })).toBeInTheDocument();
  });
});
