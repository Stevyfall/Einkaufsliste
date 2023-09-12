"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
//import * as fs from "fs";
// express bereitstellen
var fs = require('fs'); // Zugriff auf Dateisystem
// ----------------------------------------------------------------------------
// Klassen
var Eintrage = /** @class */ (function () {
    function Eintrage(wer, was, wo, wann, status) {
        this.id = ++Eintrage.id_max; // Vergabe einer eindeutigen id
        this.status = status;
        this.wer = wer;
        this.was = was;
        this.wo = wo;
        this.wann = new Date(wann);
        Eintrage.stack.push(this); // Der aktuelle Eintrag wird zur Sicherung auf den Stack gelegt
    }
    Eintrage.prototype.getID = function () {
        // Ermittlung der id des rufenden Eintrags
        return this.id;
    };
    Eintrage.prototype.getStatus = function () {
        // Ermittlung des Status des rufenden Eintrags
        return this.status;
    };
    Eintrage.prototype.setStatus = function (status) {
        // Setzen des Status des rufenden Eintrags
        this.status = status;
        return this.status;
    };
    Eintrage.getLoPEintragStack = function () {
        // Rückgabe des vollständigen Stacks mit allen Einträgen
        return Eintrage.stack;
    };
    Eintrage.id_max = 0;
    Eintrage.stack = [];
    return Eintrage;
}());
var Listen = /** @class */ (function () {
    // ein Element in diesem Stack enthalten
    function Listen() {
        this.liste = [];
        Listen.stack.push(this);
    }
    Listen.prototype.getLopEintrag = function (id) {
        var list_act = undefined;
        for (var _i = 0, _a = this.liste; _i < _a.length; _i++) {
            var i = _a[_i];
            if (id === i.getID()) {
                list_act = i;
            }
        }
        return list_act;
    };
    Listen.stack = []; // Stack aller LoPs (im vorliegenden Fall ist nur
    return Listen;
}());
var login = /** @class */ (function () {
    function login(wer, was, wo, wann, status) {
        this.wer = wer;
        this.was = was;
        this.wo = wo;
        this.wann = wann;
        this.status = status;
    }
    return login;
}());
// ----------------------------------------------------------------------------
// Funktionen
function Save(list, file) {
    var log = [];
    for (var _i = 0, _a = status_aktuell.liste; _i < _a.length; _i++) {
        var i = _a[_i];
        log.push(new login(i.wer, i.was, i.wo, i.wann, i.getStatus()));
    }
    // Umwandeln des Objekts in einen JSON-String
    var logJSON = JSON.stringify(log);
    // Schreiben des JSON-Strings der LoP in die Datei mit dem Pfadnamen "file"
    fs.writeFile(file, logJSON, function (err) {
        if (err)
            throw err;
        if (logRequest)
            console.log("Liste gesichert in der Datei: ", file);
    });
    return logJSON;
}
function render(lister) {
    // Aufbereitung der aktuellen LoP als HTML-tbody
    var html_LoP = "";
    for (var i in lister.liste) {
        // Ein Element der LoP wird nur ausgegeben, wenn sein Status auf aktiv (1) steht.
        if (lister.liste[i].getStatus() === 1) {
            var id = lister.liste[i].getID();
            var wer = lister.liste[i].wer;
            var was = lister.liste[i].was;
            var wo = lister.liste[i].wo;
            var wann = lister.liste[i].wann;
            var wann_string = wann.toISOString().slice(0, 10);
            html_LoP += "<tr class='b-dot-line' id='" + id + "'>";
            html_LoP += "<td class='click-value' data-purpose='wer' " +
                "id='" + id + "'>" + wer + "</td>";
            html_LoP += "<td class='click-value as-width-100pc' data-purpose='was' " +
                "id='" + id + "'>" + was + "</td>";
            html_LoP += "<td class='click-value as-width-100pc' data-purpose='ort' id='" + id + "'>" + wo + "</td>";
            html_LoP += "<td class='click-value' data-purpose='datum'" +
                " id='" + id + "'>" + wann_string +
                "<input type='submit' value='e' class='as-button-0' data-purpose='wandel' id='aendern'>" +
                "<input type='submit' value='x' class='as-button-0' data-purpose='weg' id='loeschen'>" +
                "</td>";
            html_LoP += "</tr>";
        }
    }
    return html_LoP;
}
function renderChange(Change) {
    var id_act = Change.getID();
    var wer = Change.wer;
    var was = Change.was;
    var wo = Change.wo;
    var wann = Change.wann;
    var html_Change = "";
    html_Change += "<td><input type='text' value='" + wer + "'></td>" +
        "<td><input class='as-width-100pc' type='text' value='" +
        was + "'>" +
        "<br>" +
        " <form>" +
        "<input type = 'submit' value = 'ändern' class='as-button' " +
        "data-purpose = 'aendern' id = '" + id_act + "'>" +
        "<input type = 'submit' value = 'zurück' class='as-button' " +
        "data-purpose = 'zurück' id = '" + id_act + "'>" +
        "<input type = 'submit' value = 'löschen' class='as-button' " +
        "data-purpose = 'loeschen' id = '" + id_act + "'>" +
        "</form>" +
        "</td>" +
        "<td><input type='text' value='" + wo + "'></td>" +
        "<td><input type='text' value='" + wann.toISOString().slice(0, 10) + "'>" +
        "</td>";
    return html_Change;
}
// Globale Variablen ----------------------------------------------------------
var programmname = "Willkommen beim Einkaufen.de";
var version = '!';
var username; // aktuelle Bearbeiterperson
var status_aktuell = new Listen(); // LoP anlegen
var RunCounter = 0; // Anzahl der Serveraufrufe vom Client
// Debug Informationen über console.log ausgeben
var logRequest = true;
// ----------------------------------------------------------------------------
// Die aktuelle LoP wird bei jeder Änderung zur Sicherung und Wiederverwendung in
// einer Datei mit eindeutigem Dateinamen gespeichert.
var RunDate = (new Date()).toISOString();
var logLoPFile_work = "log/logliste.json";
var logLoPFile_save_pre = "log/logListe_";
fs.readFile(logLoPFile_work, "utf-8", function (err, Data) {
    // Einlesen der letzten aktuellen LoP -----------------------------------------
    if (err) {
        // Wenn die Datei nicht existiert, wird eine neue Liste angelegt
        status_aktuell.liste = [];
    }
    else {
        var DataJSON = JSON.parse(Data); // JSON aus den eingelesenen Daten
        for (var _i = 0, DataJSON_1 = DataJSON; _i < DataJSON_1.length; _i++) {
            var i = DataJSON_1[_i];
            // Aus dem JSON die LoP aufbauen
            status_aktuell.liste.push(new Eintrage(i.wer, i.was, i.wo, new Date(i.wann), i.status));
        }
    }
    if (logRequest)
        console.log("liste eingelesen. Anzahl der Einträge: ", status_aktuell.liste.length);
});
function makeJson() {
    var fpath = "";
}
// ----------------------------------------------------------------------------
var server = express();
var serverPort = 8080;
var serverName = programmname + " " + version;
server.listen(serverPort);
console.log("Der Server \"" + serverName + "\" steht auf Port ", serverPort, "bereit", "\nServerstart: ", RunDate);
server.use(express.urlencoded({ extended: false })); // URLencoded Auswertung ermöglichen
server.use(express.json()); // JSON Auswertung ermöglichen
// ----------------------------------------------------------------------------
// Mapping von Aliases auf reale Verzeichnisnamen im Dateisystem des Servers
// Basisverzeichnis des Webservers im Dateisystem
var rootDirectory = __dirname;
server.use("/style", express.static(rootDirectory + "/style"));
server.use("/script", express.static(rootDirectory + "/script"));
console.log("root directory: ", rootDirectory);
// ----------------------------------------------------------------------------
server.get("/", function (req, res) {
    if (logRequest)
        console.log("GET /");
    res.status(200);
    res.sendFile(rootDirectory + "/html/Liste.html");
});
server.get("/favicon.png", function (req, res) {
    // Hier wird das Icon für die Website ausgeliefert
    if (logRequest)
        console.log("GET favicon.ico");
    res.status(200);
    res.sendFile(rootDirectory + "/pics/stone.png");
});
server.get("/version", function (req, res) {
    // Hier wird die Serverversion ausgeliefert
    if (logRequest)
        console.log("GET version");
    res.status(200);
    res.send(serverName);
});
// ----------------------------------------------------------------------------
// CREATE - Neuer Eintrag in die LoP
server.post("/create", function (req, res) {
    ++RunCounter;
    // Wert vom Client aus dem JSON entnehmen
    var wer = String(req.body.wer);
    var was = String(req.body.was);
    var wo = String(req.body.wo);
    var wann = new Date(req.body.wann);
    username = wer;
    if (logRequest)
        console.log("Post /create: ", RunCounter);
    status_aktuell.liste.push(new Eintrage(wer, was, wo, wann, 1));
    Save(status_aktuell, logLoPFile_work);
    // Rendern der aktuellen LoP und Rückgabe des gerenderten Tabellenteils (tbody)
    var html_tbody = render(status_aktuell);
    res.status(200);
    res.send(html_tbody);
});
// ----------------------------------------------------------------------------
// READ
server.get("/read", function (req, res) {
    // READ - Rückgabe der vollständigen LoP als HTML-tbody
    ++RunCounter;
    var liste_aktuellLength = status_aktuell.liste.length;
    if (logRequest)
        console.log("GET /read: ", RunCounter, liste_aktuellLength);
    if (status_aktuell === undefined) {
        res.status(404);
        res.send("LoP does not exist");
    }
    else {
        // Rendern der aktuellen LoP
        var html_tbody = render(status_aktuell);
        res.status(200);
        res.send(html_tbody);
    }
});
server.post("/read", function (req, res) {
    // READ -Rückgabe der Tabellenzeile für ändern und löschen
    ++RunCounter;
    // Wert vom Client aus dem JSON entnehmen
    var id_act = Number(req.body.id_act);
    var lopChange = status_aktuell.getLopEintrag(id_act);
    if (logRequest)
        console.log("Post /read: ", RunCounter, id_act, lopChange);
    if (status_aktuell === undefined || lopChange.getStatus() !== 1) {
        res.status(404);
        res.send("Item " + id_act + " does not exist");
    }
    else {
        // Rendern der aktuellen LoP
        var html_change = renderChange(lopChange);
        res.status(200);
        res.send(html_change);
    }
});
// ----------------------------------------------------------------------------
// UPDATE - LoP-Eintrag ändern
server.post("/update", function (req, res) {
    // Werte vom Client aus dem JSON entnehmen
    ++RunCounter;
    var id_act = Number(req.body.id_act);
    var wer = String(req.body.wer);
    var was = String(req.body.was);
    var wo = String(req.body.wo);
    var wann = new Date(req.body.wann);
    if (logRequest)
        console.log("GET /update: ", RunCounter, id_act);
    var listUpdate = status_aktuell.getLopEintrag(id_act);
    if (listUpdate === undefined || listUpdate.getStatus() !== 1) {
        res.status(404);
        res.send("Item " + id_act + " does not exist");
    }
    else {
        listUpdate.wer = wer;
        listUpdate.was = was;
        listUpdate.wo = wo;
        listUpdate.wann = wann;
        // Sichern der aktuellen LoP in die Datei logLoPFile_work
        Save(status_aktuell, logLoPFile_work);
        // Rendern der aktuellen LoP
        render(status_aktuell);
        res.status(200);
        res.send("Item " + id_act + " changed");
    }
    // Rückgabe der Werte an den Client
});
// ----------------------------------------------------------------------------
// DELETE - LoP-Eintrag aus der Liste löschen
server.post("/delete", function (req, res) {
    // Wert vom Client aus dem JSON entnehmen
    ++RunCounter;
    var id_act = Number(req.body.id_act);
    var Delete = status_aktuell.getLopEintrag(id_act);
    if (logRequest)
        console.log("Post /delete: ", RunCounter, id_act, Delete);
    if (Delete === undefined || Delete.getStatus() !== 1) {
        res.status(404);
        res.send("Item " + id_act + " does not exist");
    }
    else {
        Delete.setStatus(2);
        // Sichern der aktuellen LoP in die Datei logLoPFile_work
        Save(status_aktuell, logLoPFile_work);
        res.status(200);
        res.send("Item " + id_act + " deleted");
    }
});
// ----------------------------------------------------------------------------
// SAVE - LoP in Datei mit Datumstempel sichern
server.get("/save", function (req, res) {
    ++RunCounter;
    if (logRequest)
        console.log("Get /save: ", RunCounter);
    var logRunDate = (new Date()).toISOString().replace(/:/, "-").replace(/:/, "-");
    var logLoPFile_save = logLoPFile_save_pre + logRunDate + ".json";
    console.log(logLoPFile_save);
    Save(status_aktuell, logLoPFile_save);
    res.status(200);
    res.send("Liste saved");
});
// ----------------------------------------------------------------------------
server.use(function (req, res) {
    // Es gibt keine reguläre Methode im Server für die Beantwortung des Requests
    ++RunCounter;
    if (logRequest)
        console.log("Fehler 404", req.url);
    res.status(404);
    res.set('content-type', 'text/plain; charset=utf-8');
    var urlAnfrage = req.url;
    res.send(urlAnfrage +
        "\n\nDie gewünschte Anfrage kann vom Webserver \"" + serverName +
        "\" nicht bearbeitet werden!");
});
