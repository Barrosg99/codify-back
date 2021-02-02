/* eslint-disable no-unused-vars */
'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('users', {
			id: {
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
				type: Sequelize.INTEGER
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true
			},
			avatarUrl: {
				type: Sequelize.STRING,
				allowNull: true,
			}
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('users');
	}
};
