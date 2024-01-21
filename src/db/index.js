import { Sequelize } from "sequelize";
import { Account } from "./models/Account.model.js";


const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./sqlite_db/db.sqlite"
});

const synchronizeDB = async (isForce=false) => {
    await sequelize.sync({ force: isForce });
};



const db = {
    sequelize,
    models: {
        Account: Account(sequelize)
    },
    synchronizeDB
};



export default db;