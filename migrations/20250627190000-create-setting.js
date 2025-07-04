'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Auths',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      experience: {
        type: Sequelize.STRING,
        allowNull: true
      },
      employees: {
        type: Sequelize.STRING,
        allowNull: true
      },
      languages: {
        type: Sequelize.JSON,
        allowNull: true
      },
      categories: {
        type: Sequelize.JSON,
        allowNull: true
      },
      workingTime: {
        type: Sequelize.STRING,
        allowNull: true
      },
      averageWage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      location: {
        type: Sequelize.JSON,
        allowNull: true
      },
      logoUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      coverPhotoUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notifications: {
        type: Sequelize.JSON,
        allowNull: true
      },
      privacy: {
        type: Sequelize.JSON,
        allowNull: true
      },
      language: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'en'
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'UTC'
      },
      theme: {
        type: Sequelize.ENUM('light', 'dark', 'auto'),
        allowNull: true,
        defaultValue: 'light'
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
    await queryInterface.dropTable('Settings');
  }
}; 