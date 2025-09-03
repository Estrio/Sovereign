import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

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

async function loadDashboard() {
  const querySnapshot = await getDocs(collection(db, "raids"));
  let raids = [];
  querySnapshot.forEach(doc => raids.push(doc.data()));

  document.getElementById("totalRaids").textContent = raids.length;

  let totalSales = raids.reduce((sum, r) => sum + (r.totalSale || 0), 0);
  document.getElementById("totalSales").textContent = totalSales.toLocaleString();

  // 🔹 Track payouts
  let memberTotals = {};
  raids.forEach(r => {
    let share = r.participants?.length ? (r.totalSale || 0) / r.participants.length : 0;
    r.participants?.forEach(p => {
      memberTotals[p] = (memberTotals[p] || 0) + share;
    });
  });

  // 🔹 Leaderboard
  let leaderboardDiv = document.getElementById("leaderboard");
  let sorted = Object.entries(memberTotals).sort((a,b) => b[1]-a[1]);
  leaderboardDiv.innerHTML = sorted.map(([m, val], i) =>
    `<div>${i+1}. ${m} — ${val.toFixed(2)}</div>`
  ).join("");

  // Top Earner
  document.getElementById("topEarner").textContent =
    sorted.length > 0 ? `${sorted[0][0]} (${sorted[0][1].toFixed(2)})` : "-";

  // 🔹 Recent Raids
  let recentDiv = document.getElementById("recentRaids");
  raids.slice(-5).reverse().forEach(r => {
    recentDiv.innerHTML += `<div><strong>${r.boss}</strong> (${r.date}) — ${r.totalSale || 0}</div>`;
  });

  // 🔹 Chart
  let ctx = document.getElementById("salesChart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: sorted.map(([m]) => m),
      datasets: [{
        data: sorted.map(([_, v]) => v),
        backgroundColor: ["#4cafef","#ff9800","#8bc34a","#f44336","#9c27b0","#03a9f4"]
      }]
    }
  });
}

loadDashboard();
