module.exports = {
  buildHandshake,
};

function buildHandshake(context, events, done) {
  if (!process.env.WS_BASE_URL) {
    return done(new Error('WS_BASE_URL es obligatorio. Ejemplo: WS_BASE_URL=https://tu-host'));
  }

  if (!process.env.WS_ID_DEPARTAMENTO) {
    return done(new Error('WS_ID_DEPARTAMENTO es obligatorio.'));
  }

  if (!process.env.WS_TOKEN) {
    return done(new Error('WS_TOKEN es obligatorio.'));
  }

  context.vars.idDepartamento = process.env.WS_ID_DEPARTAMENTO;
  context.vars.token = process.env.WS_TOKEN;
  return done();
}
