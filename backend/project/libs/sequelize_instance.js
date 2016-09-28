"use strict";

module.exports = function(Sequelize) {
  const exports = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
    dialect: "postgres",
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    /* eslint-disable no-console */
    logging: console.log
    /* eslint-enable no-console */
  });

  return exports;
};
