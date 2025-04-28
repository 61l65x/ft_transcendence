
const setupGameDashboardJs = async () => {
    try {
        const params = new URLSearchParams(window.location.hash.split("?")[1]);
        const section = params.get("section") || "overview"; 
        const userId = localStorage.getItem("user_id");

        console.log(`📈 Loading Game Stats | Section:: ${section.toUpperCase()}`);

        populateUserSelectGame();
        switch (section) {
            case "overview":
                document.getElementById("loadStatsBtnGame").addEventListener("click", () => {
                      const userId = document.getElementById("userSelectGame").value;

                      if (!userId) {
                        alert("Please select a user.");
                        return;
                      }

                      initializeGameStatsOverview(userId);
                    });
                break;
            // case "matches":
            //     initializeGameHistory();
            //     break;
            case "trends":
                initializeTrends();
                break;
            default:
                console.error(`❌ Unknown gamestats section: ${section}`);
        }
    } catch (error) {
        console.error("Error setting up the gamestats dashboards:", error);
    }
};

// export function setupGameDashboardJs() {
//   console.log("✅ setupGameDashboardJs available");
// }
