// JS/index.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCagSfjutHNoHTfssxb_bzLIvXchlGGwmA",
  authDomain: "sovereign-afd67.firebaseapp.com",
  projectId: "sovereign-afd67",
  storageBucket: "sovereign-afd67.appspot.com",      // ✅ fix
  messagingSenderId: "498901354278",
  appId: "1:498901354278:web:efaeea15e4d2cff79563e7",
  measurementId: "G-53FJQYSDY5"
};

const app = initializeApp(firebaseConfig);
// Analytics is optional; guard it to avoid errors in unsupported envs
isSupported().then((ok) => { if (ok) getAnalytics(app); }).catch(() => {});
// ==================== RAID LOGIC ====================


let raids = JSON.parse(localStorage.getItem("raids")) || [];

function addRaid() {
  let boss = document.getElementById("bossName").value;
  let date = document.getElementById("raidDate").value;
  let participants = document.getElementById("participants").value.split(",").map(p => p.trim()).filter(p => p);
  let dropsRaw = document.getElementById("drops").value.split("\n");
  let drops = dropsRaw.map(line => {
    let [item, price] = line.split("-");
    return { item: item.trim(), price: parseFloat(price) || 0 };
  });

  let totalSale = drops.reduce((sum, d) => sum + d.price, 0);
  let share = participants.length > 0 ? totalSale / participants.length : 0;

  let raid = { boss, date, participants, drops, totalSale, share };
  raids.push(raid);
  localStorage.setItem("raids", JSON.stringify(raids));

  displayRaidResult(raid);
  displayHistory();
}

function displayRaidResult(raid) {
  let html = `<strong>${raid.boss}</strong> (${raid.date})<br>`;
  html += `Total Sale: ${raid.totalSale} USDT<br>`;
  html += `Participants: ${raid.participants.join(", ")}<br>`;
  html += `Each Share: ${raid.share.toFixed(2)} USDT<br>`;
  document.getElementById("raidResult").innerHTML = html;
}

function displayHistory() {
  let earnings = {};
  let html = "";
  raids.forEach((raid, idx) => {
    html += `<div class="raid-entry"><strong>Raid ${idx+1}: ${raid.boss}</strong> (${raid.date})<br>`;
    html += `Total Sale: ${raid.totalSale} USDT<br>`;
    html += `Participants: ${raid.participants.join(", ")}<br>`;
    html += `Each Share: ${raid.share.toFixed(2)} USDT</div>`;

    raid.participants.forEach(p => {
      if (!earnings[p]) earnings[p] = 0;
      earnings[p] += raid.share;
    });
  });

  html += "<h3>💰 Member Total Earnings</h3>";
  for (let member in earnings) {
    html += `${member}: ${earnings[member].toFixed(2)} USDT<br>`;
  }

  document.getElementById("raidHistory").innerHTML = html;
}

// Load history on page load
displayHistory();

  // ==================== DROPDOWNS: populate ====================
  const keys = [
    ["Zheyn", "Zheyn", "Zheyn"],
    ["Alyssa", "Alyssa", "Alyssa"],
    ["Mia", "Mia", "Mia"],
  ];

function populateMemberDropdown(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = "<option value=''>-- Select --</option>";
  keys.forEach(([value, label]) => {
    const opt = document.createElement("option");
    opt.value = value;         // this will be saved as the participant ID
    opt.textContent = label;   // this is what the user sees
    select.appendChild(opt);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  populateMemberDropdown("memberCount");
});

// ==================== END DROPDOWNS ====================

// Expose addRaid to global scope for button onclick
window.addRaid = addRaid;


const guildMembers = [
  "zheyn",
  "choi",
  "pendragon",
  "alyssa",
  "mia",
  "arthur",
  "seraphine",
  "jaycol",
  "t4g",
  "reiji",
  "patch01",
  "tulisan05",
  "hoshina",
  "thirdyboy",
  "psychee",
  "maze r",  // if OCR splits MazeR into 2 words, you may need to adjust
  "eisen",
  "suprimo",
  "excarlet",
  "kunsume",  // etc, add full roster
  "patch01",
  "Hoshina",
];


// OCR: process uploaded image and extract text
async function extractMembersFromImage(file) {
  const { createWorker } = Tesseract;

  const worker = await createWorker("eng", 1, {
    logger: m => console.log(m)
  });

  const result = await worker.recognize(file);
  await worker.terminate();

  let text = result.data.text;
  console.log("OCR RAW TEXT:", text);

  let words = text.split(/\s+|\n/).map(w => w.trim().toLowerCase()).filter(Boolean);
  console.log("WORDS:", words);

  // match only names in guildMembers
  let recognized = words.filter(w => guildMembers.includes(w));

  return recognized;
}
// Expose to global scope for event listener
window.extractMembersFromImage = extractMembersFromImage;

document.getElementById("imageUpload").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;

  let members = await extractMembersFromImage(file);
  document.getElementById("participants").value = members.join(", ");
});

