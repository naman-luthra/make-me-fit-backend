import { createConnection } from 'mysql2/promise';

const uri = process.env.DB_URI;
let connection;

export const connectToDB = async () => {
    connection = await createConnection(uri);
}

export const getConnectionToDB = async () => {
    await connection.connect();
    return connection;
}