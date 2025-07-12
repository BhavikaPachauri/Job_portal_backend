'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  Admin.init({
    fullName: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    isSuperAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resetToken: DataTypes.STRING,
    resetTokenExpiry: DataTypes.DATE,
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationToken: DataTypes.STRING,
    verificationTokenExpiry: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Admin',
  });
  return Admin;
}; 