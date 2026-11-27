// Configuración de Jest
module.exports = {
  // jsdom simula el navegador; la versión "fixed" agrega fetch, Response, etc. que necesita MSW
  testEnvironment: 'jest-fixed-jsdom',
  testEnvironmentOptions: { customExportConditions: [''] },

  // Se ejecuta antes de cada archivo de pruebas (MSW + jest-dom)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Babel transforma JSX e import/export
  transform: { '^.+\\.(c|m)?jsx?$': 'babel-jest' },
  // React Router 8 y MSW usan librerías que vienen solo como módulos ES,
  // así que Babel transforma node_modules, salvo las librerías grandes que ya funcionan en Jest
  transformIgnorePatterns: [
    '/node_modules/(react|react-dom|scheduler|@babel|@jest|jest-.*|jsdom|graphql|@apollo|rxjs|tslib|@testing-library)/',
  ],

  // Los estilos no se prueban: se reemplazan por un objeto vacío
  moduleNameMapper: { '\\.css$': '<rootDir>/src/test/estilosMock.cjs' },

  // Cobertura: todo el código de src, menos el arranque y archivos de apoyo de las pruebas
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/mocks/browser.js',
    '!src/test/**',
    '!src/**/*.test.{js,jsx}',
  ],
  // La pauta pide al menos 50% en sentencias, funciones y líneas
  coverageThreshold: {
    global: { statements: 50, functions: 50, lines: 50 },
  },
  testTimeout: 20000,
};
