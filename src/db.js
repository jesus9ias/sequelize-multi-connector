import Sequelize from 'sequelize';

function connectDb(contextConf, logger) {
  return new Sequelize(contextConf.database, contextConf.username, contextConf.password, {
    host: contextConf.host,
    port: contextConf.port,
    dialect: contextConf.dialect,
    dialectOptions: {
      multipleStatements: true
    },
    pool: contextConf.pool,
    logging: logger,
    timezone: contextConf.timezone
  });
}

function registerModel(context, connections, modelName, definition) {
  return connections[context].define(modelName, definition.fields, definition.config);
};

function initialize(context, models, connections) {
  const registeredModels = {};
  models(context).forEach((model) => {
    registeredModels[model.file] = registerModel(context, connections, model.file, model.data);
  })
  return registeredModels;
};

function connecting(contexts, config, models, ENV, logger = false) {
  const connections = {};
  const refs = {};

  contexts.forEach((context) => {
    connections[context] = connectDb(config[context][ENV], logger);
    refs[context] = initialize(context, models, connections);
  });

  return {
    models: refs,
    instances: connections
  };
}

export default connecting;
