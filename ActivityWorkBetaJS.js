//======================================================
// Activity Beta Work
// Scriptable Version 1
//
// Purpose:
//   - If an activity is already running:
//       * Calculate elapsed time
//       * POST the completed activity to Make.com
//       * Clear the activity JSON
//
//   - Otherwise:
//       * Ask for a new activity
//       * Ask for department
//       * Ask for notes
//       * Save the activity to activity_timer.json
//
//======================================================

console.log("===== Activity Tracker Started =====");


//------------------------------------------------------
// CONFIGURATION
//------------------------------------------------------

const WEBHOOK =
"https://hook.us2.make.com/REPLACE_WITH_YOURS";

const ACTIVITIES = [
    "Development",
    "Troubleshooting",
    "System Administration",
    "Meeting"
];

const DEPARTMENTS = [
    "Engineering",
    "Stormwater",
    "Wastewater Collections",
    "Water Distribution",
    "LPD",
    "Public Works"
];


//------------------------------------------------------
// Open the JSON file in iCloud
//------------------------------------------------------

const fm = FileManager.iCloud(); //Scriptable only library
//here are some more Scriptable only classes
// FileManager !!!
// Request !!!
// Alert !!!
// Notification
// Safari
// Calendar
// Reminder
// Photos
// Location
// Speech
// QuickLook
// UITable

const jsonPath = fm.joinPath(
    fm.documentsDirectory(),
    "activity_timer.json"
);

console.log("JSON Path:");
console.log(jsonPath);


//------------------------------------------------------
// Download json
//------------------------------------------------------

await fm.downloadFileFromiCloud(jsonPath); // default dir is Scriptable folder in iCloud

console.log("JSON downloaded from iCloud.");


//------------------------------------------------------
// Read JSON
//------------------------------------------------------

let state = JSON.parse(
    fm.readString(jsonPath)
);

console.log("Current JSON:");
console.log(JSON.stringify(state, null, 2));


//======================================================
// IS SOMETHING CURRENTLY RUNNING?
//======================================================
//check json
if (state.isRunning) {

    console.log("Activity is currently running.");
    console.log("Preparing to stop it.");

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

    //--------------------------------------------------
    // Final message
    //--------------------------------------------------

    let done = new Alert();

    done.title = "Activity Logged";

    done.message =
`Task: ${payload.Task}

Department: ${payload.Department}

Minutes: ${duration}

Comment: ${payload.Comment}`;

    done.addAction("OK");

    await done.present();
}

//======================================================
// NO ACTIVITY IS RUNNING
//======================================================

else {

    console.log("No activity running.");
    console.log("Starting a new activity.");

    //--------------------------------------------------
    // Choose Activity
    //--------------------------------------------------

    let menu = new Alert();

    menu.title = "Choose Task";

    //expanded Version
//     for (let i = 0; i < ACTIVITIES.length; i++) {
//     menu.addAction(ACTIVITIES[i]);
// }
    //short version
    ACTIVITIES.forEach(item =>
        menu.addAction(item));

    //gets the index of the activity
    let activityIndex =
        await menu.present();

    let activity =
        ACTIVITIES[activityIndex];

    console.log("Activity Selected:");
    console.log(activity);


    //--------------------------------------------------
    // Choose Department
    //--------------------------------------------------

    let depMenu = new Alert();

    depMenu.title =
        "Choose Department";

    DEPARTMENTS.forEach(item =>
        depMenu.addAction(item));

    let depIndex =
        await depMenu.present();

    let department =
        DEPARTMENTS[depIndex];

    console.log("Department Selected:");
    console.log(department);


    //--------------------------------------------------
    // Ask for Notes
    //--------------------------------------------------

    let notePrompt = new Alert();

    notePrompt.title =
        "Provide a Comment";

    notePrompt.addTextField("");//creates the text field with a default value

    notePrompt.addAction("OK"); // adds the OK button

    await notePrompt.present();

    let note =
        notePrompt.textFieldValue(0);

    console.log("Comment:");
    console.log(note);


    //--------------------------------------------------
    // Save New Activity
    //--------------------------------------------------

    state.activity = activity;

    state.department = department;

    state.note = note;

    // ISO format is reliable for future calculations.
    state.start = new Date().toISOString();

    state.isRunning = true;

    console.log("Updated JSON:");
    console.log(JSON.stringify(state, null, 2));


    //--------------------------------------------------
    // Write JSON back to iCloud
    //--------------------------------------------------

    fm.writeString(
        jsonPath,
        JSON.stringify(state, null, 2)
    );

    console.log("JSON written to iCloud.");


    //--------------------------------------------------
    // Inform user
    //--------------------------------------------------

    let started = new Alert();

    started.title = "Activity Started";

    started.message =
`${activity}

Department:
${department}

Comment:
${note}`;

    started.addAction("OK");

    await started.present();

}

console.log("===== Activity Tracker Finished =====");
