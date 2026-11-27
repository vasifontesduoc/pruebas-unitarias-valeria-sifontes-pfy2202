import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  test('arranca con el menú y la página de destinos', async () => {
    render(<App />);

    expect(screen.getByRole('link', { name: /Rumbo Sur/ })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Menú principal' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: '¿A dónde quieres viajar?' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Cusco' })).toBeInTheDocument();
  });
});
