'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Setting.belongsTo(models.Auth, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  
  Setting.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Auths',
        key: 'id'
      }
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 20]
      }
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
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
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50]
      }
    },
    employees: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50]
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
    categories: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isArray(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Categories must be an array');
          }
        }
      }
    },
    workingTime: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50]
      }
    },
    averageWage: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50]
      }
    },
    location: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isObject(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Location must be an object');
          }
        }
      }
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    coverPhotoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    notifications: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isObject(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Notifications must be an object');
          }
        }
      }
    },
    privacy: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isObject(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Privacy must be an object');
          }
        }
      }
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'en',
      validate: {
        len: [2, 5]
      }
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'UTC',
      validate: {
        len: [0, 50]
      }
    },
    theme: {
      type: DataTypes.ENUM('light', 'dark', 'auto'),
      allowNull: true,
      defaultValue: 'light'
    }
  }, {
    sequelize,
    modelName: 'Setting',
  });
  
  return Setting;
}; 