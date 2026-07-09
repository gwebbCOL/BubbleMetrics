//======================================================
//Activity Work Beta - runs if 'isRunning' == True
//
//======================================================

const WEBHOOK =
"https://hook.us2.make.com/82ejlamukucdca3iac2tdkm1xfx6alnl";
//------------------------------------------------------
// Open the JSON file in iCloud
//------------------------------------------------------

const fm = FileManager.iCloud(); //Scriptable only library


const jsonPath = fm.joinPath(
    fm.documentsDirectory(),
    "activity_timer.json"
);

console.log("JSON Path:");
console.log(jsonPath);


//------------------------------------------------------
// Download json
//------------------------------------------------------

await fm.downloadFileFromiCloud(jsonPath); // default directory is Scriptable folder in iCloud
//console.log("JSON downloaded from iCloud.");

//------------------------------------------------------
// Read JSON
//------------------------------------------------------
let state = JSON.parse(
    fm.readString(jsonPath)
);

console.log("Current JSON:");
console.log(JSON.stringify(state, null, 2));

//--------------------------------------------------
// Convert stored start time into Date object
//--------------------------------------------------

let start = new Date(state.start);

//--------------------------------------------------
// Current time
//--------------------------------------------------

let end = new Date();

//--------------------------------------------------
// Calculate elapsed minutes
//--------------------------------------------------
//date objects can add/subtract
//the subtraction an answer in milliseconds thus 60 x 1000 to convert to minutes
//floor always runs down
let duration =
    Math.floor((end - start) / 60000);

console.log("Duration:");
console.log(duration + " minutes");

//--------------------------------------------------
// Format today's date
//--------------------------------------------------

let df = new DateFormatter();
df.dateFormat = "M/d/yyyy";

let formattedDate =
    df.string(end);

//--------------------------------------------------
// Build http request POST payload
//--------------------------------------------------

let payload = {
    Task: state.activity,
    Department: state.department,
    Comment: state.note,
    Duration: duration,
    Date: formattedDate
};

console.log("POST Payload:");
console.log(JSON.stringify(payload, null, 2));

//--------------------------------------------------
// Send POST to Make.com
//--------------------------------------------------

let req = new Request(WEBHOOK);

req.method = "POST";

req.headers = {
    "Content-Type":"application/json"
};

req.body = JSON.stringify(payload);

console.log("Sending POST...");

let response = await req.loadString();

console.log("POST completed.");

console.log(response);

//--------------------------------------------------
// Clear JSON
//--------------------------------------------------

state.activity = "";
state.department = "";
state.note = "";
state.start = "";
state.isRunning = false;

console.log("JSON reset.");

//--------------------------------------------------
// Save JSON
//--------------------------------------------------

fm.writeString(
    jsonPath,
    JSON.stringify(state, null, 2)
);

console.log("JSON saved.");

let outputText =
`Task: ${payload.Task}
Department: ${payload.Department}
Comment: ${payload.Comment}
Duration: ${duration} minutes
Date: ${formattedDate}`;

Script.setShortcutOutput(outputText);
Script.complete();
