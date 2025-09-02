// ========== FIREBASE IMPORTS ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// 🔹 Global variables
let raids = JSON.parse(localStorage.getItem("raids")) || [];
let lootItems = []; // ✅ loot storage

// ========== FIREBASE CONFIG ==========
const firebaseConfig = {
  apiKey: "AIzaSyCagSfjutHNoHTfssxb_bzLIvXchlGGwmA",
  authDomain: "sovereign-afd67.firebaseapp.com",
  projectId: "sovereign-afd67",
  storageBucket: "sovereign-afd67.appspot.com",
  messagingSenderId: "498901354278",
  appId: "1:498901354278:web:efaeea15e4d2cff79563e7",
  measurementId: "G-53FJQYSDY5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
isSupported().then(ok => { if (ok) getAnalytics(app); }).catch(() => {});

// ========== ADD RAID ==========
async function addRaid() {
  let boss = document.getElementById("bossName").value;
  let date = new Date().toISOString().split("T")[0];
  let participants = document.getElementById("participants").value
    .split(",")
    .map(p => p.trim())
    .filter(p => p);

  // ✅ include loot
  let lootInput = document.getElementById("lootItem").value.trim();
  if (lootInput && !lootItems.includes(lootInput)) {
    lootItems.push(lootInput);
  }

  let drops = [...lootItems];
  let totalSale = drops.length * 100; // example calculation
  let share = participants.length > 0 ? totalSale / participants.length : 0;

  let raid = { boss, date, participants, drops, totalSale, share };

  try {
    let docRef = await addDoc(collection(db, "raids"), raid);
    raid.id = docRef.id;

    raids.push(raid);
    localStorage.setItem("raids", JSON.stringify(raids));

    console.log("Raid saved to Firebase ✅", docRef.id);
  } catch (e) {
    console.error("Error saving raid: ", e);
  }

  displayRaidResult(raid);
  displayHistory();
  loadRegisteredLoot(); // 🔹 update loot list

  // ✅ reset loot input
  lootItems = [];
  document.getElementById("lootItem").value = "";
}

// ========== DISPLAY RAID RESULT ==========
function displayRaidResult(raid) {
  let html = `<strong>${raid.boss}</strong> (${raid.date})<br>`;
  html += `Total Sale: ${raid.totalSale} USDT<br>`;
  html += `Participants: ${raid.participants.join(", ")}<br>`;
  html += `Each Share: ${raid.share.toFixed(2)} USDT<br>`;
  if (raid.drops && raid.drops.length > 0) {
    html += `Loot: ${raid.drops.join(", ")}<br>`;
  }
  document.getElementById("raidResult").innerHTML = html;
}

// ========== DISPLAY HISTORY ==========
function displayHistory() {
  let html = "";
  raids.forEach((raid, idx) => {
    html += `<div class="raid-entry">
      <strong>Raid ${idx + 1}: ${raid.boss}</strong> (${raid.date})<br>
      Total Sale: ${raid.totalSale} USDT<br>
      Participants: ${raid.participants.join(", ")}<br>
      Each Share: ${raid.share.toFixed(2)} USDT<br>`;
    if (raid.drops && raid.drops.length > 0) {
      html += `Loot: ${raid.drops.join(", ")}<br>`;
    }
    html += `<button onclick="deleteRaid(${idx})">🗑️ Delete</button>
    </div>`;
  });
  document.getElementById("raidHistory").innerHTML = html;
}

// ========== DELETE RAID ==========
async function deleteRaid(index) {
  const raid = raids[index];

  // 🔹 remove locally
  raids.splice(index, 1);
  localStorage.setItem("raids", JSON.stringify(raids));

  // 🔹 remove from Firestore
  try {
    if (raid.id) {
      await deleteDoc(doc(db, "raids", raid.id));
      console.log("Raid deleted from Firestore ✅");
    } else {
      console.warn("No Firestore ID for this raid, only deleted locally.");
    }
  } catch (e) {
    console.error("Error deleting raid: ", e);
  }

  displayHistory();
  loadRegisteredLoot(); // refresh loot
}
window.deleteRaid = deleteRaid;

// ========== REGISTERED LOOT ==========
async function loadRegisteredLoot() {
  try {
    const querySnapshot = await getDocs(collection(db, "raids"));
    let allLoot = [];

    querySnapshot.forEach(docSnap => {
      let raidData = docSnap.data();
      if (raidData.drops && Array.isArray(raidData.drops)) {
        allLoot.push(...raidData.drops);
      }
    });

    allLoot = [...new Set(allLoot)]; // unique only

    let lootListDiv = document.getElementById("lootList");
    if (allLoot.length === 0) {
      lootListDiv.innerHTML = "No loot registered yet.";
    } else {
      lootListDiv.innerHTML = allLoot
        .map((item, i) => `<div class="loot-entry">${i + 1}. ${item}</div>`)
        .join("");
    }
  } catch (e) {
    console.error("Error loading registered loot: ", e);
  }
}

// ========== OCR (Tesseract) ==========
const guildMembers = [
  "zheyn","choi","pendragon","alyssa","mia","arthur","seraphine","jaycol",
  "t4g","reiji","patch01","tulisan05","hoshina","thirdyboy","psychee",
  "maze r","eisen","suprimo","excarlet","kunsume","hoshina","rhy7",
  "sapphirebleu","jalapenio","dukesa","xlyz","ynaaa","pepper0o8","shiin"
];

async function extractMembersFromImage(file) {
  const { createWorker } = Tesseract;
  const worker = await createWorker("eng", 1, { logger: m => console.log(m) });
  const result = await worker.recognize(file);
  await worker.terminate();

  let words = result.data.text
    .split(/\s+|\n/)
    .map(w => w.trim().toLowerCase())
    .filter(Boolean);

  return words.filter(w => guildMembers.includes(w));
}

document.getElementById("imageUpload").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;

  let members = await extractMembersFromImage(file);
  document.getElementById("participants").value = members.join(", ");
});

// ========== INIT ==========
displayHistory();
loadRegisteredLoot();
window.addRaid = addRaid;
