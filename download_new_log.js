const ftp = require("basic-ftp");
const fs = require("fs");

async function downloadLog() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "152.53.68.13",
            user: "profesoral",
            password: "jp92#0C2r",
            secure: false
        });
        await client.downloadTo("laravel_remote_new.log", "/backend-php/storage/logs/laravel.log");
        console.log("Downloaded new laravel.log");
    } catch(err) {
        console.error(err);
    }
    client.close();
}
downloadLog();
