import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { obtener, leerCache, rutas, simularErrorRest } from '../services/api';

describe('services/api (REST)', () => {
  test('obtiene la lista de destinos desde el mock REST', async () => {
    const destinos = await obtener(rutas.destinos());
    expect(destinos).toHaveLength(6);
    expect(destinos[0]).toHaveProperty('pais');
    expect(destinos[0]).toHaveProperty('actividades');
  });

  test('guarda la lista en caché y también cada destino por separado', async () => {
    await obtener(rutas.destinos());
    expect(leerCache(rutas.destinos())).toHaveLength(6);
    expect(leerCache(rutas.destino('cusco')).ciudad).toBe('Cusco');
  });

  test('si se pide dos veces al mismo tiempo, comparte la misma petición', () => {
    const primera = obtener(rutas.destinos());
    const segunda = obtener(rutas.destinos());
    expect(segunda).toBe(primera);
    return primera;
  });

  test('responde desde la caché sin volver a pedir', async () => {
    await obtener(rutas.destino('madrid'));
    // Si se hiciera otra petición, este handler la haría fallar
    server.use(http.get('/api/destinos/:id', () => HttpResponse.json({}, { status: 500 })));
    const madrid = await obtener(rutas.destino('madrid'));
    expect(madrid.ciudad).toBe('Madrid');
  });

  test('la caché vence después de 5 minutos', async () => {
    await obtener(rutas.destino('cusco'));
    const ahora = Date.now();
    const espia = jest.spyOn(Date, 'now').mockReturnValue(ahora + 6 * 60 * 1000);
    expect(leerCache(rutas.destino('cusco'))).toBeUndefined();
    espia.mockRestore();
  });

  test('un destino que no existe devuelve el mensaje del servidor (404)', async () => {
    await expect(obtener(rutas.destino('lima'))).rejects.toThrow('El destino "lima" no existe.');
  });

  test('un error 500 sin mensaje muestra un texto claro', async () => {
    server.use(http.get('/api/destinos', () => new HttpResponse(null, { status: 503 })));
    await expect(obtener(rutas.destinos())).rejects.toThrow('El servidor tuvo un problema (503)');
  });

  test('un error 4xx sin mensaje indica que no se encontró', async () => {
    server.use(http.get('/api/destinos', () => new HttpResponse(null, { status: 404 })));
    await expect(obtener(rutas.destinos())).rejects.toThrow('No se encontró la información solicitada (404).');
  });

  test('si no hay conexión muestra un error de red', async () => {
    server.use(http.get('/api/destinos', () => HttpResponse.error()));
    await expect(obtener(rutas.destinos())).rejects.toThrow('No se pudo conectar con el servidor');
  });

  test('simularErrorRest devuelve el error 500 del mock', async () => {
    await expect(simularErrorRest()).rejects.toThrow('Error interno del servidor (500)');
  });
});
