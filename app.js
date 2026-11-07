// Importing Firebase packages to use with the HTML page
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, doc, writeBatch, increment } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-cq7lVqJuyEFDf_XvsN0gP36ZF94spkE",
  authDomain: "dbfl-3f1fb.firebaseapp.com",
  projectId: "dbfl-3f1fb",
  storageBucket: "dbfl-3f1fb.firebasestorage.app",
  messagingSenderId: "100561522057",
  appId: "1:100561522057:web:1c03b38adb82752c6a2558",
  measurementId: "G-ESSC5P276P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const savedId = localStorage.getItem("dbflId");
if (savedId) {
    document.getElementById("dbflId").value = savedId;
}

//Gets the Date ID for when players upload their stats
function getDateId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Function to update the firestore database
async function submitStats(playerId, statsData) {
    
    // Prefix for current season - Current: TURKEY BOWL
    const SEASON_PREFIX = "TURKEY_"
    const seasonId = SEASON_PREFIX + playerId;
    const gameId = getDateId();

    const playerRef = doc(db, "players", playerId);
    const seasonRef = doc(db, "season_stats", seasonId);
    const gameRef = doc(db, "season_stats", seasonId, "games", gameId);

    const batch = writeBatch(db);

    const seasonIncrementedStats = {
        pass_tds: increment(statsData.passTDs),
        rec_tds: increment(statsData.recTDs),
        ints_off: increment(statsData.offINTs),
        ints_def: increment(statsData.defINTs),
        yds: increment(statsData.passYDs + statsData.recYDs),
    };

    const playerIncrementedStats = {
        total_pass_tds: increment(statsData.passTDs),
        total_pass_yds: increment(statsData.passYDs),
        total_rec_tds: increment(statsData.recTDs),
        total_rec_yds: increment(statsData.recYDs),
        total_ints_off: increment(statsData.offINTs),
        total_ints_def: increment(statsData.defINTs),
        total_yds: increment(statsData.passYDs + statsData.recYDs),
        total_tds: increment(statsData.passTDs + statsData.recTDs),
    };

    const gameIncrementedStats = {
        pass_tds: increment(statsData.passTDs),
        pass_yds: increment(statsData.passYDs),
        rec_tds: increment(statsData.recTDs),
        rec_yds: increment(statsData.recYDs),
        ints_off: increment(statsData.offINTs),
        ints_def: increment(statsData.defINTs),
    };

    batch.set(playerRef, playerIncrementedStats, { merge: true });
    batch.set(seasonRef, seasonIncrementedStats, { merge: true });
    batch.set(gameRef, gameIncrementedStats, { merge: true });

    await batch.commit();
}

document.getElementById("driveStats").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const dbflID = document.getElementById("dbflId").value;
    const statsData = {
        passTDs: Number(document.getElementById("passTDs").value),
        passYDs: Number(document.getElementById("passYDs").value),
        recTDs: Number(document.getElementById("recTDs").value),
        recYDs: Number(document.getElementById("recYDs").value),
        offINTs: Number(document.getElementById("offINTs").value),
        defINTs: Number(document.getElementById("defINTs").value),
    };

    try {
        await submitStats(dbflID, statsData);
        localStorage.setItem("dbflId", dbflID);
        document.getElementById("statusMessage").textContent = "Stats submitted!";

        document.getElementById("driveStats").reset();
        document.getElementById("dbflId").value = dbflID;
    } catch (error) {
        console.error(error);
        document.getElementById("statusMessage").textContent = "Something went wrong - try again";
    }
});