'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      City.belongsTo(models.State, { foreignKey: 'stateId' });
    }
  }
  City.init({
    name: DataTypes.STRING,
    stateId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'City',
  });
  return City;
};