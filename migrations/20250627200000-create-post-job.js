'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PostJobs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      job_title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      job_description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      job_location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      workplace_type: {
        type: Sequelize.ENUM('Remote', 'On-site', 'Hybrid'),
        allowNull: false,
        defaultValue: 'On-site'
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
      tags: {
        type: Sequelize.JSON,
        allowNull: true
      },
      posted_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Auths',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      posted_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'draft', 'expired'),
        allowNull: false,
        defaultValue: 'active'
      },
      company_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      company_logo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      experience_level: {
        type: Sequelize.ENUM('Entry', 'Mid', 'Senior', 'Lead', 'Executive'),
        allowNull: true
      },
      job_type: {
        type: Sequelize.ENUM('Full time', 'Part time', 'Contract', 'Internship', 'Freelance'),
        allowNull: true,
        defaultValue: 'Full time'
      },
      application_deadline: {
        type: Sequelize.DATE,
        allowNull: true
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
      is_featured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      requirements: {
        type: Sequelize.JSON,
        allowNull: true
      },
      benefits: {
        type: Sequelize.JSON,
        allowNull: true
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: true
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
    await queryInterface.dropTable('PostJobs');
  }
}; 