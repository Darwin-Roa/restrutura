const ftp = require("basic-ftp");

async function checkFtp() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "152.53.68.13",
            user: "profesoral",
            password: "jp92#0C2r",
            secure: false
        });
        await client.downloadTo("check_db_tables_remote.php", "/backend-php/check_db_tables.php");
        console.log("Downloaded check_db_tables.php");
    } catch(err) {
        console.error(err);
    }
    client.close();
}
checkFtp();
