const mysql = require("mysql2/promise");

async function testDb() {
    try {
        const connection = await mysql.createConnection({
            host: "159.195.15.66",
            port: 3307,
            user: "unisimon",
            password: "9nHYoDWInA9oPUS2aRA3",
            database: "unisimon"
        });
        console.log("SUCCESS: Connected to MariaDB!");
        const [rows] = await connection.execute("SHOW TABLES");
        console.log("Tables:", rows.map(r => Object.values(r)[0]));
        await connection.end();
    } catch(err) {
        console.error("FAIL:", err.message);
    }
}
testDb();
