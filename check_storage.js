const ftp = require("basic-ftp");

async function checkStorage() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "152.53.68.13",
            user: "profesoral",
            password: "jp92#0C2r",
            secure: false
        });
        console.log("== STORAGE/APP DIRECTORY ==");
        const list = await client.list("/backend-php/storage/app");
        console.log(list.map(i => i.name));
    } catch(err) {
        console.error(err);
    }
    client.close();
}
checkStorage();
