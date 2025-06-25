//requires
const http = require('http'); //http server erstellen
const sqlite3 = require('sqlite3'); //datenbank sqlite 
const sqlite = require('sqlite'); //""
const fs = require('fs'); //fileSystem

//constanten
const pathDb = 'C:\\Users\\issig\\Desktop\\Uni\\Webentwicklung-Projekt\\server\\data.db';//Path zu sq datenbank
const localHost = '127.0.0.1'; //LocalhostID Server läuft nur lokal
const port = 3000; // welche daten für welche anwendung. port auf server bekommt infos. kommunikationsschnittstelle

///********************************************************************************************************/
///methoden für server
///*******************************************************************************************************/

//server erstellen und starten
console.log("server erstellt");
const server = http.createServer(async (req, res) => {
    // Set CORS headers. domains erlauben
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allows all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allows specific methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allows specific headers

    // Handle preflight requests. (Cross-Origin-Anfrage) options anfrage
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    //POst anfrage übertragung in Nachrichtenkörper
    if (req.method === 'POST' && req.url.startsWith('/ADDIMAGE')) { //befehl mit capslock
        let body = ''; //sammeln der empfangenen daten
        console.log("request");
        //Daten in chunks übertragen
        req.on('data', chunk => {
            body += chunk.toString(); //Chunk als String anhängen
        });

        //wenn alle nachrichten angekommen sind
        req.on('end', () => {
            console.log('Received POST data:', body);
            //antwort an client senden
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end("Data received:");

            // Get name of the project with the url parameter
            const urlString = "http://" + localHost + req.url;
            const urlObj = new URL(urlString);
            const params = urlObj.searchParams;
            const projectName = params.get("name");
            //daten in datenbank 
            addImage(projectName, body);
        });
    }

    //Daten mit Update behandeln und abändern
    if (req.method === 'POST' && req.url.startsWith('/UPDATE')) { //befehl mit capslock
        let body = ''; //variable für daten 
        console.log("request");

        req.on('data', chunk => {
            body += chunk.toString();//daten werden an body als chunk angehängt 
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

            updateImage(projectName, body);
        });
    }

    //Getnames behandeln
    if (req.method === 'GET' && req.url.startsWith('/GETNAMES')) { //befehl mit capslock
        //get all names
        const returnString = await getAllNames();

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(returnString);
    }

    if (req.method === 'GET' && req.url.startsWith('/GETDATA')) { //befehl mit capslock
        // url auslesen
        const urlString = "http://" + localHost + req.url;
        const urlObj = new URL(urlString);
        const params = urlObj.searchParams;
        const projectName = params.get("name");
        //daten als json string zurückgeben
        const returnString = await getData(projectName);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(returnString);
    }
});


// Server starten, hört auf ip und port
server.listen(port, localHost, () => {
    console.log(`Server running at http://${localHost}:${port}/`);
});


///********************************************************************************************************/
///methoden zur interaktion mit datenbank
///*******************************************************************************************************/

//funktion um in datenbank hinzuzufügen (Bilddaten)
async function addImage(projectName, data) {
    //Datenbank öffnen
    const db = await sqlite.open({
        filename: pathDb,
        driver: sqlite3.Database,
    });
    //Daten in highscoretabelle eintragen, falls schon vorhanden ignorieren
    await db.run(
        `INSERT OR IGNORE INTO highscoreTable(name, data) VALUES (?, ?)`,
        [projectName.toString(), data.toString()]
    );

    console.log(`Project "${projectName}" inserted or ignored (if already existed).`);
    //datenbank schliessen 
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
        //was bei error passiert in konsole ausgeben
        function (err) {
            if (err) {
                return console.error(err.message);
            }
            //wenn kein error in konsole ausgeben
            console.log(`Project ${projectName} updated`);
        });
    //Datenbank schliessen 
    await db.close();
}


//lädt namen aus db
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
    //namen als json string zurückgeben 
    await db.close();
    return JSON.stringify(allKeys);
}


//lädt daten aus db 
async function getData(name) {
    //datenbank öffnen
    const db = await sqlite.open({
        filename: pathDb,
        driver: sqlite3.Database,
    });//Daten aus highscoretabelle holen
    const data = await db.get(`SELECT data FROM highscoreTable WHERE name =?`, name);
    //datenbank schliessen
    await db.close();
    //Als json string zurückgeben
    return JSON.stringify(data);
}
