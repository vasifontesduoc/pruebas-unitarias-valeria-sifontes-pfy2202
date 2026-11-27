import { render, screen } from '@testing-library/react';
import Disponibilidad from '../components/Disponibilidad';
import EstadoVacio from '../components/EstadoVacio';
import MensajeError from '../components/MensajeError';
import ResumenViaje from '../components/ResumenViaje';
import OrigenDato from '../components/OrigenDato';
import { renderizarConRouter } from '../test/renderizar';

const destino = { ciudad: 'Cusco', pais: 'Perú', bandera: '🇵🇪' };
const vuelo = {
  aerolinea: 'LATAM',
  codigo: 'LA 2410',
  fechaIda: '2026-12-05',
  fechaVuelta: '2026-12-11',
  precio: 449990,
};
const hotel = { nombre: 'Casona Inti', precioPorNoche: 69990 };

describe('Disponibilidad', () => {
  test('sin cupos', () => {
    render(<Disponibilidad cantidad={0} unidad="asientos" />);
    expect(screen.getByText('Sin asientos disponibles')).toBeInTheDocument();
  });

  test('pocos cupos', () => {
    render(<Disponibilidad cantidad={3} unidad="habitaciones" />);
    expect(screen.getByText('¡Quedan solo 3 habitaciones!')).toBeInTheDocument();
  });

  test('muchos cupos', () => {
    render(<Disponibilidad cantidad={12} unidad="asientos" />);
    expect(screen.getByText('12 asientos disponibles')).toBeInTheDocument();
  });
});

describe('EstadoVacio y OrigenDato', () => {
  test('EstadoVacio muestra título y mensaje', () => {
    render(<EstadoVacio titulo="Sin resultados" mensaje="Prueba otra búsqueda" />);
    expect(screen.getByRole('heading', { name: 'Sin resultados' })).toBeInTheDocument();
    expect(screen.getByText('Prueba otra búsqueda')).toBeInTheDocument();
  });

  test('OrigenDato indica de qué API viene el dato', () => {
    render(<OrigenDato tipo="GraphQL" detalle="query VuelosYHoteles" />);
    expect(screen.getByText(/GraphQL/)).toBeInTheDocument();
  });
});

describe('MensajeError', () => {
  test('muestra el mensaje y llama a onReintentar', async () => {
    const onReintentar = jest.fn();
    const { usuario } = renderizarConRouter(<MensajeError mensaje="Falló la API" onReintentar={onReintentar} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Falló la API');
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onReintentar).toHaveBeenCalledTimes(1);
  });

  test('sin onReintentar no muestra el botón', () => {
    renderizarConRouter(<MensajeError mensaje="Error" />);
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver todos los destinos' })).toBeInTheDocument();
  });
});

describe('ResumenViaje', () => {
  test('sin selección pide elegir vuelo y hotel', () => {
    render(<ResumenViaje destino={destino} vuelo={null} hotel={null} pasajeros={1} habitaciones={1} noches={null} />);
    expect(screen.getByText('Elige un vuelo')).toBeInTheDocument();
    expect(screen.getByText('Elige un hotel')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  test('con vuelo y hotel calcula el total y permite limpiar', async () => {
    const onLimpiar = jest.fn();
    const { usuario } = renderizarConRouter(
      <ResumenViaje
        destino={destino}
        vuelo={vuelo}
        hotel={hotel}
        pasajeros={2}
        habitaciones={1}
        noches={6}
        onLimpiar={onLimpiar}
      />
    );
    // 2 pasajeros × $449.990 + 6 noches × $69.990
    expect(screen.getByText('$1.319.920')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('¡Tu viaje está listo para reservar!');

    await usuario.click(screen.getByRole('button', { name: 'Limpiar selección' }));
    expect(onLimpiar).toHaveBeenCalled();
  });

  test('con hotel pero sin vuelo pide elegir vuelo para calcular noches', () => {
    render(<ResumenViaje destino={destino} vuelo={null} hotel={hotel} pasajeros={1} habitaciones={1} noches={null} />);
    expect(screen.getByText(/Elige un vuelo para calcular las noches/)).toBeInTheDocument();
  });
});
