// ========== FIREBASE IMPORTS ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

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
  let date = new Date().toLocaleString("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});

  let participants = document.getElementById("participants").value
    .split(",")
    .map(p => p.trim())
    .filter(p => p);

  // ✅ include loot
let lootInput = document.getElementById("lootItem").value.trim();
let lootPrice = parseFloat(document.getElementById("lootPrice")?.value) || 0;

if (lootInput && !lootItems.find(l => l.name === lootInput)) {
  lootItems.push({ name: lootInput, price: lootPrice });
}

let drops = [...lootItems];
let totalSale = drops.reduce((sum, item) => sum + (item.price || 0), 0);
let share = participants.length > 0 ? totalSale / participants.length : 0;



console.log("Drops being saved:", drops);
console.log("Participants being saved:", participants);
console.log("Total Sale:", totalSale, "Share:", share);


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
  loadRegisteredLoot();
loadRegisteredMembers(); // ✅ add this

  

  // ✅ reset loot input
  lootItems = [];
  document.getElementById("lootItem").value = "";
}

// ========== DISPLAY RAID RESULT ==========
function displayRaidResult(raid) {
  let html = `<strong>${raid.boss}</strong> (${raid.date})<br>`;
  html += `Participants: ${raid.participants.join(", ")}<br>`;
  if (raid.drops && raid.drops.length > 0) {
    html += `Loot: ${raid.drops.map(d => typeof d === "string" ? d : `${d.name} (${d.price || 0})`).join(", ")}<br>`;
  }
  document.getElementById("raidResult").innerHTML = html;
}

// ========== DISPLAY HISTORY ==========
function displayHistory() {
  let html = "";
  raids.forEach((raid, idx) => {
    html += `<div class="raid-entry">
      <strong>Raid ${idx + 1}: ${raid.boss}</strong> (${raid.date})<br>
      Participants: ${raid.participants.join(", ")}<br>`;
    if (raid.drops && raid.drops.length > 0) {
      html += `Loot: ${raid.drops.map(d => typeof d === "string" ? d : `${d.name} (${d.price || 0})`).join(", ")}<br>`;
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
loadRegisteredLoot();
loadRegisteredMembers(); // ✅ add this

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
        // merge loot from all raids
        raidData.drops.forEach(drop => {
          if (typeof drop === "string") {
            allLoot.push({ name: drop, price: 0 });
          } else {
            allLoot.push(drop);
          }
        });
      }
    });

    // remove duplicates by name
    let uniqueLoot = [];
    let seen = new Set();
    allLoot.forEach(l => {
      if (!seen.has(l.name)) {
        seen.add(l.name);
        uniqueLoot.push(l);
      }
    });

    let lootListDiv = document.getElementById("lootList");
    if (uniqueLoot.length === 0) {
      lootListDiv.innerHTML = "No loot registered yet.";
    } else {
      lootListDiv.innerHTML = uniqueLoot
        .map(
          (item, i) => `
          <div class="loot-entry">
            ${i + 1}. <strong>${item.name}</strong>
            <input type="number" value="${item.price || 0}" 
              onchange="updateLootPrice('${item.name}', this.value)">
          </div>`
        )
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
// ========== INIT ==========
displayHistory();
loadRegisteredLoot();
loadRegisteredMembers();   // ✅ new line
window.addRaid = addRaid;



// ========== REGISTERED MEMBERS ==========
// ========== REGISTERED MEMBERS ==========
async function loadRegisteredMembers() {
  try {
    const querySnapshot = await getDocs(collection(db, "raids"));
    let memberEarnings = {};

    querySnapshot.forEach(docSnap => {
      let raidData = docSnap.data();
      if (!raidData.participants || !Array.isArray(raidData.participants)) return;

      let totalSale = raidData.drops?.reduce((sum, item) => {
        if (typeof item === "string") return sum; // old string loot
        return sum + (item.price || 0);
      }, 0) || 0;

      let share = raidData.participants.length > 0
        ? totalSale / raidData.participants.length
        : 0;

      raidData.participants.forEach(member => {
        if (!memberEarnings[member]) memberEarnings[member] = 0;
        memberEarnings[member] += share;
      });
    });

    let membersDiv = document.getElementById("membersList");
    let names = Object.keys(memberEarnings);

    if (names.length === 0) {
      membersDiv.innerHTML = "No members registered yet.";
    } else {
      membersDiv.innerHTML = names
        .map((m, i) => `<div class="member-entry">${i + 1}. ${m} — ${memberEarnings[m].toFixed(2)} USDT</div>`)
        .join("");
    }
  } catch (e) {
    console.error("Error loading registered members: ", e);
  }
}


async function updateLootPrice(lootName, newPrice) {
  try {
    const querySnapshot = await getDocs(collection(db, "raids"));
    querySnapshot.forEach(async docSnap => {
      let raidData = docSnap.data();
      if (raidData.drops && Array.isArray(raidData.drops)) {
        let updated = false;
        let newDrops = raidData.drops.map(drop => {
          if (typeof drop === "string") {
            if (drop === lootName) {
              updated = true;
              return { name: drop, price: Number(newPrice) };
            }
            return { name: drop, price: 0 };
          } else if (drop.name === lootName) {
            updated = true;
            return { ...drop, price: Number(newPrice) };
          }
          return drop;
        });

        if (updated) {
          // 🔹 Recalculate totalSale & share
          let totalSale = newDrops.reduce((sum, item) => sum + (item.price || 0), 0);
          let share = raidData.participants.length > 0
            ? totalSale / raidData.participants.length
            : 0;

          await updateDoc(doc(db, "raids", docSnap.id), {
            drops: newDrops,
            totalSale,
            share
          });
          console.log(`✅ Updated price of ${lootName} to ${newPrice} in raid ${docSnap.id}`);
        }
      }
    });

    // refresh UI
// refresh UI
displayHistory();
loadRegisteredLoot();
loadRegisteredMembers(); // ✅ refresh members too

  } catch (e) {
    console.error("Error updating loot price: ", e);
  }
}

window.updateLootPrice = updateLootPrice;

async function exportCSV() {
  try {
    const querySnapshot = await getDocs(collection(db, "raids"));
    let raidsFromDB = [];

    querySnapshot.forEach(docSnap => {
      raidsFromDB.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (raidsFromDB.length === 0) {
      alert("No raids to export.");
      return;
    }

    // CSV Header
    let csv = "Boss,Date,Loot,TotalSale,Participant,Share\n";

    // 🔹 tracker for total payouts
    let memberTotals = {};

    raidsFromDB.forEach(raid => {
      const formatNum = (num) => (num ? Number(num).toLocaleString() : "0");

      let totalSale = raid.totalSale || 0;
      if (!totalSale && raid.drops) {
        totalSale = raid.drops.reduce((sum, d) => sum + (d.price || 0), 0);
      }

      let share = raid.share || 0;
      if ((!share || share === 0) && raid.participants && raid.participants.length > 0) {
        share = totalSale / raid.participants.length;
      }

      raid.drops.forEach((drop, dropIndex) => {
        const lootName = drop.name || "Unknown";
        const lootPrice = drop.price || 0;

        if (raid.participants && raid.participants.length > 0) {
          csv += `"${raid.boss}","${raid.date}","${lootName} (${formatNum(lootPrice)})","${formatNum(totalSale)}","${raid.participants[0]}","${formatNum(share)}"\n`;

          // accumulate
          memberTotals[raid.participants[0]] = (memberTotals[raid.participants[0]] || 0) + share;

          for (let i = 1; i < raid.participants.length; i++) {
            csv += `,,,,"${raid.participants[i]}","${formatNum(share)}"\n`;
            memberTotals[raid.participants[i]] = (memberTotals[raid.participants[i]] || 0) + share;
          }
        } else {
          csv += `"${raid.boss}","${raid.date}","${lootName} (${formatNum(lootPrice)})","${formatNum(totalSale)}",,\n`;
        }
      });

      // total row per raid
      csv += `,,,,"Total Sale","${formatNum(totalSale)}"\n\n`;
    });

    // 🔹 Append member payouts summary
    csv += "\nParticipant,Payout\n";
    Object.keys(memberTotals).forEach(member => {
      csv += `"${member}","${memberTotals[member].toFixed(2)}"\n`;
    });

    // Download CSV
    let blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "raid_history.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    console.error("Error exporting CSV: ", e);
  }
}

window.exportCSV = exportCSV;

