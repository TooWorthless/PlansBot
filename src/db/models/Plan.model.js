import { DataTypes } from "sequelize";


export const Plan = (sequelize) => {
    const Plan = sequelize.define("Plan", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        accountId: {
            type: DataTypes.INTEGER
        },
        text: {
            type: DataTypes.TEXT('long')
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "inProgress"
        },
        date: {
            type: DataTypes.STRING
        }
    });

    return Plan;
};