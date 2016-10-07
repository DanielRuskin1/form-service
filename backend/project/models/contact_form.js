"use strict";

module.exports = function(sequelizeInstance, Sequelize) {
  // ContactForms represent a given form that can be used to send messages to the owner
  var exports = sequelizeInstance.define(
    "contact_form",
    {
      uuid: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING(1000),
        field: "name",
        allowNull: false,
        validate: {
          len: [1, 1000]
        }
      },
      ownerCognitoId: {
        type: Sequelize.STRING,
        field: "ownerCognitoId",
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      ownerEmail: {
        type: Sequelize.STRING,
        field: "ownerEmail",
        allowNull: false,
        validate: {
          isEmail: true,
          len: [1, 1000]
        }
      }
    },
    {
      freezeTableName: true, // Model tableName will be the same as the model name
      paranoid: true // "Deleted" objects will have deletedAt set, but will not be destroyed completely
    }
  );

  return exports;
};
