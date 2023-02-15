const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Expense extends Model { }



Expense.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        amountspent: {
            type: DataTypes.FLOAT,
        },
        note: {
            type: DataTypes.STRING,
            allowNull: false,
      
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'user',
                key: 'id',
            },
        },
        category_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'budget_category',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        timestamps: false,
        freezeTableName: true,
        underscored: true,
        modelName: 'expense',
    }
);

module.exports = Expense;

