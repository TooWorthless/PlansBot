import { DataTypes } from "sequelize";


export const Account = (sequelize) => {
    const Account = sequelize.define("Account", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        tgId: {
            type: DataTypes.INTEGER
        },
        data: {
            type: DataTypes.TEXT('long'),
            defaultValue: "{}"
        },
        info: {
            type: DataTypes.INTEGER
        },
        lang: {
            type: DataTypes.STRING,
            defaultValue: "ukr"
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: "default"
        },
        regDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });

    return Account;
};