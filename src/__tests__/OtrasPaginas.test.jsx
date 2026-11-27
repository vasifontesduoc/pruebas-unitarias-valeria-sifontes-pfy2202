import { screen } from '@testing-library/react';
import { renderizarEnRuta } from '../test/renderizar';

describe('Página Cómo funciona', () => {
  test('explica REST vs GraphQL', async () => {
    renderizarEnRuta('/como-funciona');

    expect(await screen.findByRole('heading', { level: 1, name: 'Cómo funciona' })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('el botón de error REST muestra el error 500 y permite reintentar', async () => {
    const { usuario } = renderizarEnRuta('/como-funciona');
    await screen.findByRole('heading', { level: 1, name: 'Cómo funciona' });

    await usuario.click(screen.getByRole('button', { name: 'Simular error 500 en REST' }));
    expect(screen.getByText('Consultando al servidor...')).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent('Error interno del servidor (500)');

    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Error interno del servidor (500)');
  });

  test('el botón de error GraphQL muestra el mensaje del mock', async () => {
    const { usuario } = renderizarEnRuta('/como-funciona');
    await screen.findByRole('heading', { level: 1, name: 'Cómo funciona' });

    await usuario.click(screen.getByRole('button', { name: 'Simular error en GraphQL' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('El servicio de vuelos no está disponible');
  });
});

describe('Página no encontrada y menú', () => {
  test('una ruta que no existe muestra la página 404', async () => {
    renderizarEnRuta('/esta-ruta-no-existe');

    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver destinos' })).toBeInTheDocument();
  });

  test('el menú lleva a "Cómo funciona"', async () => {
    const { usuario } = renderizarEnRuta('/');
    await screen.findByRole('heading', { name: 'Cusco' });

    await usuario.click(screen.getByRole('link', { name: 'Cómo funciona' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Cómo funciona' })).toBeInTheDocument();
  });
});
