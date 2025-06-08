const http = require('http'); //http server
const sqlite3 = require('sqlite3'); //datenbank
const sqlite = require('sqlite');
const fs = require('fs'); //fileSystem

const pathDb = 'C:\\Users\\issig\\Desktop\\Uni\\Webentwicklung-Projekt\\server\\data.db';

const localHost = '127.0.0.1';
const port = 3000; // welche daten für welche anwendung 

//server erstellen 
console.log("server erstellt");
const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allows all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allows specific methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allows specific headers

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url.startsWith('/ADDIMAGE')) { //befehl mit capslock
        let body = '';
        console.log("request");

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log('Received POST data:', body);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end("Data received:");

            // Get name of the project with the url parameter
            const urlString = "http://" + localHost + req.url;
            const urlObj = new URL(urlString);
            const params = urlObj.searchParams;
            const projectName = params.get("name");

            addImage(projectName, body);
        });
    }

    if (req.method === 'GET' && req.url.startsWith('/GETNAMES')) { //befehl mit capslock
        const returnString = await getAllNames();

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(returnString);
    }

    if (req.method === 'GET' && req.url.startsWith('/GETDATA')) { //befehl mit capslock

        const urlString = "http://" + localHost + req.url;
        const urlObj = new URL(urlString);
        const params = urlObj.searchParams;
        const projectName = params.get("name");

    const returnString= await getData(projectName);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(returnString);
    }
});

server.listen(port, localHost, () => {
    console.log(`Server running at http://${localHost}:${port}/`);
});
//funktion um in datenbank hinzuzufügen
async function addImage(projectName, data) {
    const db = await sqlite.open({
        filename: pathDb,
        driver: sqlite3.Database,
    });

    await db.run(
        `INSERT OR IGNORE INTO highscoreTable(name, data) VALUES (?, ?)`, //wenn key schon vorhanden ignorieren
        [projectName.toString(), data.toString()]
    );

    console.log(`Project "${projectName}" inserted or ignored (if already existed).`);

    await db.close();
}

//funktion daten für vorhandenes ändern 
async function updateImage(projectName, data) {
    //database öffnen
    const db = await sqlite.open({
        filename: pathDb,
        driver: sqlite3.Database,
    });
    //was mit datenbank gemacht wird 
    db.run(`UPDATE highscoreTable SET data =? WHERE name =?`, [data.toString(), projectName.toString()],
        //was bei error passiert
        function (err) {
            if (err) {
                return console.error(err.message);
            }
            //wenn kein error 
            console.log(`Project ${projectName} updated`);
        });
    //Datenbank schliessen 
    await db.close();

}
async function getAllNames() {
    const db = await sqlite.open({
        filename: pathDb,
        driver: sqlite3.Database,
    });

    // Nur die Namen abrufen
    const rows = await db.all(`SELECT name FROM highscoreTable`);

    // Namen extrahieren und in ein Array umwandeln
    const allKeys = rows.map(row => row.name);

    console.log("Alle Keys (name):", allKeys);

    await db.close();
    return JSON.stringify(allKeys);

}
async function getData(name) {
    //datenbank öffnen
    const db = await sqlite.open({
        filename: pathDb,
        driver: sqlite3.Database,
    });
    const data = await db.get(`SELECT data FROM highscoreTable WHERE name =?`, name);
    //datenbank schliessen
    await db.close();
    return JSON.stringify(data);
}
