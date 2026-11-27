import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { renderizarEnRuta } from '../test/renderizar';

describe('Página Inicio (REST)', () => {
  test('muestra la carga y luego los 6 destinos del mock', async () => {
    renderizarEnRuta('/');

    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    expect(await screen.findByRole('heading', { name: 'Cusco' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Ver vuelos y hoteles/ })).toHaveLength(6);
  });

  test('el buscador filtra por país sin importar las tildes', async () => {
    const { usuario } = renderizarEnRuta('/');
    await screen.findByRole('heading', { name: 'Cusco' });

    await usuario.type(screen.getByRole('searchbox', { name: 'Buscar destinos' }), 'peru');

    expect(screen.getByRole('heading', { name: 'Cusco' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Madrid' })).not.toBeInTheDocument();
  });

  test('el buscador también encuentra por actividad', async () => {
    const { usuario } = renderizarEnRuta('/');
    await screen.findByRole('heading', { name: 'Cusco' });

    await usuario.type(screen.getByRole('searchbox', { name: 'Buscar destinos' }), 'tango');

    expect(screen.getByRole('heading', { name: 'Buenos Aires' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Ver vuelos y hoteles/ })).toHaveLength(1);
  });

  test('sin coincidencias muestra un mensaje', async () => {
    const { usuario } = renderizarEnRuta('/');
    await screen.findByRole('heading', { name: 'Cusco' });

    await usuario.type(screen.getByRole('searchbox', { name: 'Buscar destinos' }), 'tokio');

    expect(screen.getByText('No encontramos destinos')).toBeInTheDocument();
  });

  test('si el servidor falla muestra el error y permite reintentar', async () => {
    server.use(http.get('/api/destinos', () => new HttpResponse(null, { status: 500 })));
    const { usuario } = renderizarEnRuta('/');

    expect(await screen.findByRole('alert')).toHaveTextContent('El servidor tuvo un problema (500)');

    server.resetHandlers(); // el servidor "se recupera"
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('heading', { name: 'Cusco' })).toBeInTheDocument();
  });

  test('al hacer clic en un destino navega a su página', async () => {
    const { usuario } = renderizarEnRuta('/');
    await screen.findByRole('heading', { name: 'Cusco' });

    await usuario.click(screen.getByRole('link', { name: /Cusco/ }));

    expect(await screen.findByRole('heading', { level: 1, name: /Cusco/ })).toBeInTheDocument();
  });
});
