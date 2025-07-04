'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Profile.belongsTo(models.Auth, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  Profile.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Auths',
        key: 'id'
      }
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 20]
      }
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 2000]
      }
    },
    education: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isArray(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Skills must be an array');
          }
        }
      }
    },
    languages: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isArray(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Languages must be an array');
          }
        }
      }
    },
    expectedSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    currentSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    socialLinks: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isObject(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Social links must be an object');
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Profile',
  });
  return Profile;
}; 