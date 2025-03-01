document.addEventListener("view-changed", ({ detail }) => {
    if (detail.path === "#game") checkGameMode();
});

const checkGameMode = () => {
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const type = params.get("type") || "local";  // Default: Local game
    const mode = params.get("mode") || "1v1";    // Default: 1v1 mode

    console.log(`🎮 Starting ${type.toUpperCase()} | Mode: ${mode.toUpperCase()}`);

    setTimeout(() => {
        const canvas = document.getElementById("pong");
        if (!canvas) {
            console.error("❌ Pong canvas not found! Game cannot start.");
            return;
        }

        switch (type) {
            case "online":
                initializeOnlineGame(mode);
                break;
            case "local":
                switch (mode) {
                    case "tournament":
                        initializeTournament();
                        break;
                    case "1v1":
                    default:
                        initializeGame();
                        break;
                }
                break;
            default:
                console.error(`❌ Unknown game type: ${type}`);
        }
    }, 100);
};
