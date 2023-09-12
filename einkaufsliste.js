var servicename;
var statuscode = 0;
var userid;
var logEvent;
var logEventfull;
//--------------------------------------------------------------------------------------------------------------------------
function start() {
    var request = new XMLHttpRequest();
    request.open('GET', 'version');
    request.send();
    request.onload = function (event) {
        if (request.status === 200) {
            servicename = request.response;
            document.getElementById("Liste_title").innerHTML = servicename;
            document.getElementById("top").innerHTML = servicename;
            console.log(servicename);
        }
        else {
            console.log("Fehler bei der Uebertragung", request.status);
            if (logEvent)
                console.log("Fehler bei der Uebertragung", request.status, "\n", event);
        }
    };
}
//-----------------------------------------------------------------------------------------------------------------------------
function Eingaben(event) {
    event.preventDefault();
    userid = document.getElementById("user-id").value;
    if (logEvent)
        console.log("Eingabedaten: ", userid);
    var Liste = document.getElementById("einkauf");
    Liste.classList.remove("as-unsichtbar");
    Liste.classList.add("as-sichtbar");
    auflisten();
}
//----------------------------------------------------------------------------------------------------------------------------
function auflisten() {
    var tabbdy = document.getElementById("tabbody");
    var html_liste = "";
    var request = new XMLHttpRequest();
    request.open('GET', 'read');
    request.send();
    request.onload = function (event) {
        if (request.status === 200) {
            html_liste = request.response;
            if (logEventfull)
                console.log("Ergebnis vom Server: ", html_liste);
            tabbdy.innerHTML = html_liste;
            var Saveliste = document.getElementById("bottom");
            Saveliste.classList.remove("as-unsichtbar");
            Saveliste.classList.add("as-sichtbar");
            statuscode = 0;
        }
        else {
            console.log("Fehler bei der Übertragung", request.status);
            if (logEvent)
                console.log("Fehler bei der Übertragung", request.status, "\n", event);
        }
    };
}
//--------------------------------------------------------------------------------------------------------------------------
function execute(event) {
    event.preventDefault();
    var command = event.submitter.value;
    if (command === "neu") {
        disable(event);
        disneu(event);
        if (logEvent)
            console.log("function execute -> new");
        if (statuscode === 0) {
            statuscode = 1;
            var tabbody = document.getElementById("tabbody");
            var html = tabbody.innerHTML;
            var newDate = (new Date()).toISOString().slice(0, 10);
            var tab_row = "<tr class='b-dot-line' id='" + undefined + "'>" +
                "<td data-purpose='wer' id='" + undefined + "'>" +
                "<input name='Wer' type='text' id='" + undefined + "' value=" + userid + "></td>" +
                "<td data-purpose='was' id='" + undefined + "'>" +
                "<form>" +
                "<input name = 'Was' type = 'text'  " +
                "placeholder = 'was'  class= 'as-width-100pc' data-input ='was'>" +
                "<br>" +
                "<input type = 'submit' value = 'speichern' class='as-button-0' " +
                "data-purpose = 'speichern' id = 'undefinded'>" +
                "<input type = 'submit' value = 'zurück' class='as-button' " +
                "data-purpose = 'zurück' id = 'undefinded'>" +
                "</form>" +
                "</td>" +
                "<td data-purpose='wo' id='" + undefined + "'>" +
                "<input name = 'wo' type = 'text'  " +
                "placeholder = 'wo'  class= 'as-width-100pc' data-input ='wo'>" +
                "</td>" +
                "<td data-purpose='wann' id='" + undefined + "'>" +
                "<input  name='Wann' type='text' " +
                " id='" + undefined + "' data-purpose='wann'" +
                "' value = " + newDate + ">" +
                "</td>" +
                "</tr>";
            tabbody.innerHTML = tab_row + html;
        }
    }
    else if (command === "sichern") {
        enneu(event);
        if (logEvent)
            console.log("function execute -> sichern");
        //  let name: string = new JSON;
        var request_1 = new XMLHttpRequest();
        request_1.open('GET', 'save');
        request_1.send();
        request_1.onload = function (event) {
            if (request_1.status === 200) { // Erfolgreiche Rückgabe
                if (logEventfull)
                    console.log("Daten gesichert");
                auflisten();
            }
            else { // Fehlermeldung vom Server
                console.log("Fehler bei der Übertragung", request_1.status);
                if (logEvent)
                    console.log("Fehler bei der Übertragung", request_1.status, "\n", event);
            }
        };
    }
    else {
        if (logEvent)
            console.log("function execute -> ?");
    }
}
//---------------------------------------------------------------------------------------------------------------------------------
function changes(event) {
    event.preventDefault();
    if (logEvent)
        console.log("changes -> tabbody; click");
    if (logEventfull)
        console.log("\"createUpdateDelete -> tabbody; click", event);
    var command = event.target.getAttribute("data-purpose");
    var idSelect = event.target.getAttribute("id");
    if (logEvent)
        console.log("command: ", command, "id: ", idSelect);
    if (command === "zurück") {
        enable(event);
        enneu(event);
        if (logEvent)
            console.log("function  execute -> zurück"); // Debug
        auflisten();
    }
    else if (command === "speichern") {
        enable(event);
        enneu(event);
        if (logEvent)
            console.log("function  execute -> speichern"); // Debug
        if (statuscode === 1) {
            var was_feld = event.target.parentElement[0].value;
            if (was_feld === "") {
                auflisten();
            }
            else {
                var td_actual = event.target.parentElement.parentElement;
                var wo_aktuell = td_actual.nextSibling.childNodes[0].value;
                var wer_aktuell = td_actual.previousSibling.childNodes[0].value;
                var wann_aktuell = td_actual.nextSibling.nextSibling.childNodes[0].value;
                if (logEvent)
                    console.log("eingabe_aktuell: ", wer_aktuell, was_feld, wo_aktuell, wann_aktuell); // Debug
                var request_2 = new XMLHttpRequest();
                // Request starten
                request_2.open('POST', 'create');
                request_2.setRequestHeader('Content-Type', 'application/json');
                request_2.send(JSON.stringify({
                    "wer": wer_aktuell,
                    "was": was_feld,
                    "wo": wo_aktuell,
                    "wann": wann_aktuell,
                    "status": 1
                }));
                request_2.onload = function (event) {
                    if (request_2.status === 200) {
                        auflisten();
                    }
                    else {
                        console.log("Fehler bei der Übertragung", request_2.status);
                        if (logEvent)
                            console.log("Fehler bei der Übertragung", request_2.status, "\n", event);
                    }
                };
                auflisten();
            }
        }
    }
    else if (command === "wer" || command === "was" || command === "wo" || command === "wann") {
        disable(event);
        if (logEvent)
            console.log("function  execute -> wer, was,wo, wann"); // Debug
        if (logEventfull)
            console.log("wer, was, wo, wann: ", event.target.parentElement); // Debug
        if (statuscode === 0) {
            statuscode = 2; // Der Status 2 sperrt die Bearbeitung anderer Events, die nicht zur
            // Bearbeitung der Änderung des LoP-Eintrags gehören
            var tr_act_1 = event.target.parentElement;
            var id_act3 = Number(tr_act_1.getAttribute('id'));
            if (logEventfull)
                console.log("id_act: ", id_act3); // Debug
            // XMLHttpRequest aufsetzen und absenden
            var request_3 = new XMLHttpRequest();
            // Request starten
            request_3.open('POST', 'read');
            request_3.setRequestHeader('Content-Type', 'application/json');
            request_3.send(JSON.stringify({
                "id_act": id_act3
            }));
            request_3.onload = function (event) {
                if (request_3.status === 200) { // Erfolgreiche Rückgabe
                    var html_Change = request_3.response;
                    if (logEventfull)
                        console.log("Ergebnis vom Server: ", html_Change);
                    tr_act_1.innerHTML = html_Change;
                }
                else {
                    console.log("Fehler bei der Übertragung", request_3.status);
                    if (logEvent)
                        console.log("Fehler bei der Übertragung", request_3.status, "\n", event);
                }
            };
        }
    }
    else if (command === "loeschen") {
        // löschen --------------------------------------------------------------------------------
        if (statuscode === 2) {
            enable(event);
            if (logEvent)
                console.log("function  execute -> löschen"); // Debug
            if (logEventfull)
                console.log("löschen: ", event.target); // Debug
            // aktuelles Element ermitteln
            var id_act = Number(event.target.getAttribute('id'));
            // XMLHttpRequest aufsetzen und absenden
            var request_4 = new XMLHttpRequest();
            // Request starten
            request_4.open('POST', 'delete');
            request_4.setRequestHeader('Content-Type', 'application/json');
            request_4.send(JSON.stringify({
                "id_act": id_act
            }));
            request_4.onload = function (event) {
                // Eventhandler für das Lesen der aktuellen Tabellenzeile zum Ändern oder Löschen
                // vom Server
                if (request_4.status === 200) { // Erfolgreiche Rückgabe
                    if (logEventfull)
                        console.log("Gelöscht: ");
                    auflisten();
                }
                else { // Fehlermeldung vom Server
                    console.log("Fehler bei der Übertragung", request_4.status);
                    if (logEvent)
                        console.log("Fehler bei der Übertragung", request_4.status, "\n", event);
                }
            };
        }
    }
    else if (command === "aendern") {
        // ändern ---------------------------------------------------------------------------------
        if (statuscode === 2) {
            enable(event);
            if (logEvent)
                console.log("function  execute -> ändern"); // Debug
            if (logEventfull)
                console.log("ändern: ", event.target); // Debug
            var td_actual = event.target.parentElement.parentElement;
            var was_feld = td_actual.childNodes[0].value;
            var wo_aktuell = td_actual.nextSibling.childNodes[0].value;
            var wer_aktuell = td_actual.previousSibling.childNodes[0].value;
            var wann_aktuell = td_actual.nextSibling.nextSibling.childNodes[0].value;
            if (logEvent)
                console.log("ändern: ", wer_aktuell, was_feld, wo_aktuell, wann_aktuell); // Debug
            // aktuelles Element ermitteln
            var id_act = Number(event.target.getAttribute('id'));
            // XMLHttpRequest aufsetzen und absenden
            var request_5 = new XMLHttpRequest();
            // Request starten
            request_5.open('POST', 'update');
            request_5.setRequestHeader('Content-Type', 'application/json');
            request_5.send(JSON.stringify({
                "id_act": id_act,
                "wer": wer_aktuell,
                "was": was_feld,
                "wo": wo_aktuell,
                "wann": wann_aktuell
            }));
            request_5.onload = function (event) {
                if (request_5.status === 200) { // Erfolgreiche Rückgabe
                    auflisten();
                }
                else {
                    console.log("Fehler bei der Übertragung", request_5.status);
                    if (logEvent)
                        console.log("Fehler bei der Übertragung", request_5.status, "\n", event);
                }
            };
        }
    }
    else if (command === "wandel") {
        disable(event);
        if (logEvent)
            console.log("function  execute -> wer, was,wo, wann"); // Debug
        if (logEventfull)
            console.log("wer, was, wo, wann: ", event.target); // Debug
        if (statuscode === 0) {
            statuscode = 2; // Der Status 2 sperrt die Bearbeitung anderer Events, die nicht zur
            // Bearbeitung der Änderung des LoP-Eintrags gehören
            var tr_act_2 = event.target.parentElement.parentElement;
            var id_act = Number(tr_act_2.getAttribute('id'));
            if (logEventfull)
                console.log("id_act: ", id_act); // Debug
            // XMLHttpRequest aufsetzen und absenden
            var request_6 = new XMLHttpRequest();
            // Request starten
            request_6.open('POST', 'read');
            request_6.setRequestHeader('Content-Type', 'application/json');
            request_6.send(JSON.stringify({
                "id_act": id_act
            }));
            request_6.onload = function (event) {
                if (request_6.status === 200) { // Erfolgreiche Rückgabe
                    var html_Change = request_6.response;
                    if (logEventfull)
                        console.log("Ergebnis vom Server: ", html_Change);
                    tr_act_2.innerHTML = html_Change;
                }
                else {
                    console.log("Fehler bei der Übertragung", request_6.status);
                    if (logEvent)
                        console.log("Fehler bei der Übertragung", request_6.status, "\n", event);
                }
            };
        }
    }
    else if (command === "weg") {
        if (statuscode === 0) {
            //  if (logEvent) console.log("function  execute -> weg"); // Debug
            //  if (logEventfull) console.log("löschen: ", event.target); // Debug
            // aktuelles Element ermitteln
            var id_act2 = Number(event.target.parentElement.getAttribute('id'));
            // XMLHttpRequest aufsetzen und absenden
            var request_7 = new XMLHttpRequest();
            // Request starten
            request_7.open('POST', 'delete');
            request_7.setRequestHeader('Content-Type', 'application/json');
            request_7.send(JSON.stringify({
                "id_act": id_act2
            }));
            request_7.onload = function (event) {
                // Eventhandler für das Lesen der aktuellen Tabellenzeile zum Ändern oder Löschen
                // vom Server
                if (request_7.status === 200) { // Erfolgreiche Rückgabe
                    if (logEventfull)
                        console.log("Gelöscht: ");
                    auflisten();
                }
                else { // Fehlermeldung vom Server
                    console.log("Fehler bei der Übertragung", request_7.status);
                    if (logEvent)
                        console.log("Fehler bei der Übertragung", request_7.status, "\n", event);
                }
            };
        }
    }
    else {
        if (logEvent)
            console.log("function  execute -> ?"); // Debug
    }
}
//---------------------------------------------------------------------------------------------------------------------------------
function disneu(event) {
    event.preventDefault();
    var neub = document.getElementById("newbutton");
    //neub.innerHTML ="<input type='submit' class='as-button'  id='newbutton' value='neu' disabled>"
    neub.disabled = true;
}
//-------------------------------------------------------------------------------------------------------------------------------------
function enneu(event) {
    event.preventDefault();
    var neub = document.getElementById("newbutton");
    //neub.innerHTML ="  <input type='submit' class='as-button'  id='newbutton' value='neu'>"
    neub.disabled = false;
}
//-----------------------------------------------------------------------------------------------------------------------------------
function disable(event) {
    event.preventDefault();
    var input = document.getElementById("datas");
    input.innerHTML = " <label for='user-id'>User-ID:</label><input id='user-id' type='text' required placeholder='user-id' value='" + userid + "' disabled>";
}
//-----------------------------------------------------------------------------------------------------------------------------------
function enable(event) {
    event.preventDefault();
    var input = document.getElementById("datas");
    input.innerHTML = " <label for='user-id'>User-ID:</label><input id='user-id' type='text' required placeholder='user-id' value='" + userid + "'>";
}
//-----------------------------------------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    start();
    document.getElementById("datas").addEventListener("submit", function (event) {
        if (logEvent)
            console.log("datas; submit"); // Debug
        Eingaben(event);
    });
    document.getElementById("bottom").addEventListener("submit", function (event) {
        if (logEvent)
            console.log("bottom; submit"); // Debug
        if (logEventfull)
            console.log("bottom; submit", event); // Debug
        // disable(event);
        execute(event);
    });
    document.getElementById("tabbody").addEventListener("click", function (event) {
        event.preventDefault();
        if (logEvent)
            console.log("list-render; click"); // Debug
        if (logEventfull)
            console.log("list-render; click", event); // Debug
        changes(event);
        //enable(event);
    });
});
