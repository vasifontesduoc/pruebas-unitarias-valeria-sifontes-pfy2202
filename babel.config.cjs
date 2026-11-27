// Configuración de Babel. Solo la usa Jest para entender JSX e import/export
// (Vite no usa este archivo).

// Vite entrega import.meta.env (por ejemplo BASE_URL). Jest no lo conoce,
// así que este pequeño plugin lo reemplaza por valores fijos durante las pruebas.
function importMetaEnvParaJest({ template }) {
  return {
    visitor: {
      MetaProperty(path) {
        if (path.node.meta.name !== 'import') return;
        const padre = path.parentPath;
        if (padre.isMemberExpression() && padre.node.property.name === 'env') {
          padre.replaceWith(template.expression.ast`({ BASE_URL: '/', MODE: 'test', DEV: false, PROD: false })`);
        } else {
          path.replaceWith(template.expression.ast`({ url: require('url').pathToFileURL(__filename).href })`);
        }
      },
    },
  };
}

module.exports = {
  sourceType: 'unambiguous',
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [importMetaEnvParaJest],
};
