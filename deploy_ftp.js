const ftp = require("basic-ftp");
const path = require("path");

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = false;
    try {
        console.log("Conectando al servidor FTP...");
        await client.access({
            host: "152.53.68.13",
            user: "profesoral",
            password: "jp92#0C2r",
            secure: false
        });

        console.log("Subiendo Frontend (frontend/dist -> /public)...");
        await client.uploadFromDir("frontend/dist", "/public");
        console.log("Frontend subido con éxito.");

        console.log("Subiendo archivos modificados del Backend...");
        
        const backendFiles = [
            { local: "backend-php/app/Http/Controllers/ExportController.php", remote: "/backend-php/app/Http/Controllers/ExportController.php" },
            { local: "backend-php/app/Services/ExportService.php", remote: "/backend-php/app/Services/ExportService.php" },
            { local: "backend-php/routes/api.php", remote: "/backend-php/routes/api.php" },
            { local: "backend-php/app/Notifications/AlertaVencimiento.php", remote: "/backend-php/app/Notifications/AlertaVencimiento.php" },
            { local: "backend-php/.env", remote: "/backend-php/.env" }
        ];

        for (const file of backendFiles) {
            console.log(`Subiendo ${file.local}...`);
            await client.uploadFrom(file.local, file.remote);
        }
        
        console.log("¡Todos los archivos del backend subidos exitosamente!");

    } catch(err) {
        console.error("Error durante el despliegue:", err);
    }
    client.close();
}

deploy();
