"use strict";

module.exports = function(sequelizeInstance, Sequelize, ContactForm) {
  // Messages represent a given form that can be used to send messages to the owner
  var exports = sequelizeInstance.define(
    "message",
    {
      uuid: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      processed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      subject: {
        type: Sequelize.STRING(1000),
        allowNull: false,
        validate: {
          len: [1, 1000]
        }
      },
      from: {
        type: Sequelize.STRING(1000),
        allowNull: false,
        validate: {
          isEmail: true,
          len: [1, 1000]
        }
      },
      message: {
        type: Sequelize.STRING(5000),
        allowNull: false,
        validate: {
          len: [1, 5000]
        }
      }
    },
    {
      freezeTableName: true, // Model tableName will be the same as the model name
      paranoid: true // "Deleted" objects will have deletedAt set, but will not be destroyed completely
    }
  );
  exports.belongsTo(ContactForm, { foreignKey: { allowNull: false } });

  return exports;
};
