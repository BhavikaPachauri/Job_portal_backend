'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostJob extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PostJob.belongsTo(models.Auth, {
        foreignKey: 'posted_by_user_id',
        as: 'postedBy'
      });
    }
  }
  
  PostJob.init({
    job_title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 200]
      }
    },
    job_description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 5000]
      }
    },
    job_location: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    workplace_type: {
      type: DataTypes.ENUM('Remote', 'On-site', 'Hybrid'),
      allowNull: false,
      defaultValue: 'On-site'
    },
    salary_min: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    salary_max: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    salary_currency: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'USD',
      validate: {
        len: [3, 3]
      }
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isArray(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Tags must be an array');
          }
        }
      }
    },
    posted_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Auths',
        key: 'id'
      }
    },
    posted_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'draft', 'expired'),
      allowNull: false,
      defaultValue: 'active'
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    company_logo: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    experience_level: {
      type: DataTypes.ENUM('Entry', 'Mid', 'Senior', 'Lead', 'Executive'),
      allowNull: true
    },
    job_type: {
      type: DataTypes.ENUM('Full time', 'Part time', 'Contract', 'Internship', 'Freelance'),
      allowNull: true,
      defaultValue: 'Full time'
    },
    application_deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    views_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    applications_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    requirements: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isArray(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Requirements must be an array');
          }
        }
      }
    },
    benefits: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isArray(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Benefits must be an array');
          }
        }
      }
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isArray(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Attachments must be an array');
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'PostJob',
  });
  
  return PostJob;
}; 