async function initializeGameStatsOverview(userId, username) {
  try {

    const userList = getLoggedInUsers();
    const user = userList.find(u => u.id.toString() === userId.toString());

    if (!user) {
      console.error("User not found in localStorage");
      return;
    }
    const { match_history } = await apiRequest(`users/${userId}/match-history/`, "GET");
    const matches = Array.isArray(match_history) ? match_history : [];

    const totalGames = matches.length;
    let totalScores = 0;
    let totalMargins = 0;
    let scoreCount = 0;

    matches.forEach(m => {
      if (typeof m.player1_score === "number" && typeof m.player2_score === "number") {
        totalScores += m.player1_score + m.player2_score;
        totalMargins += Math.abs(m.player1_score - m.player2_score);
        scoreCount++;
      }
//      if (Array.isArray(m.scores) && m.scores.length === 2 && m.scores.every(s => typeof s === "number")) {
      //   const [a, b] = m.scores;
      //   totalScores += a + b;
      //   totalMargins += Math.abs(a - b);
      //   scoreCount++;
      // }
    });

    console.log("the matches:", matches);
    const avgScore = scoreCount ? (totalScores / scoreCount).toFixed(1) : "N/A";
    const avgMargin = scoreCount ? (totalMargins / scoreCount).toFixed(1) : "N/A";
    const highestMatch = matches.reduce((max, m) => {
      const total = (m.player1_score || 0) + (m.player2_score || 0); 
      return total > ((max.player1_score || 0) + (max.player2_score || 0)) ? m : max;
    }, {});


    const container = document.getElementById("game-stats-overview");
    container.innerHTML = `
      <p><strong>Total Games:</strong> ${totalGames}</p>
      <p><strong>Average Score Per Match:</strong> ${avgScore}</p>
      <p><strong>Average Score Margin:</strong> ${avgMargin}</p>
      <p><strong>Highest Scoring Match:</strong> ${highestMatch.player1 || "?"} vs ${highestMatch.player2 || "?"} → ${highestMatch.player1_score ?? "?"} - ${highestMatch.player2_score ?? "?"}</p>
    `;
  } catch (err) {
    console.error("Error loading game stats overview:", err);
  }
}

function getLoggedInUsersGame() {
  return JSON.parse(localStorage.getItem("loggedInUsers") || "[]");
}

function setupUserStatsSelectorGame() {
  const userList = getLoggedInUsers();
  console.log(getLoggedInUsers());
  const select = document.getElementById("user-select");

  // Empty select
  select.innerHTML = "";

  if (!userList.length) {
    select.innerHTML = `<option>No logged-in users found</option>`;
    return;
  }

  userList.forEach(user => {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = user.username;
    select.appendChild(option);
  });

  document.getElementById("load-user-stats-btn").addEventListener("click", () => {
    const selectedId = select.value;
    const selectedUser = userList.find(u => u.id == selectedId);
    if (selectedUser) {
      initializeGameStatsOverview(selectedUser.id, selectedUser.username);
    }
  });
}


function populateUserSelectGame() {
  const users = getLoggedInUsers();
  const select = document.getElementById("userSelectGame");

  if (!select) {
    console.error("❌ Haha Select element not found");
    return;
  }
  if (!users || users.length === 0) {
    console.warn("⚠️ No users found");
    return;
  }
  users.forEach(user => {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = user.username;
    select.appendChild(option);
  });
}

