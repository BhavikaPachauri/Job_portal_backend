'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Jobs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      company_logo_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      job_title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      job_type: {
        type: Sequelize.ENUM('Full time', 'Part time', 'Contract', 'Internship', 'Freelance'),
        allowNull: false,
        defaultValue: 'Full time'
      },
      posted_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      job_description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      skills_required: {
        type: Sequelize.JSON,
        allowNull: true
      },
      salary_per_hour: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      salary_min: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      salary_max: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      salary_currency: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'USD'
      },
      apply_link: {
        type: Sequelize.STRING,
        allowNull: true
      },
      industry: {
        type: Sequelize.STRING,
        allowNull: true
      },
      experience_level: {
        type: Sequelize.ENUM('Entry', 'Mid', 'Senior', 'Lead', 'Executive'),
        allowNull: true
      },
      remote_option: {
        type: Sequelize.ENUM('On-site', 'Remote', 'Hybrid'),
        allowNull: true,
        defaultValue: 'On-site'
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      views_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      applications_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Auths',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Jobs');
  }
}; 