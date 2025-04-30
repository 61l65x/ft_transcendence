
const logoutUser = async (userId) => {
    const csrfToken = await getCSRFCookie();
    if (!csrfToken) {
        return console.error("❌ CSRF Token is missing.");
    }
    const response = await fetch(`api/users/${userId}/logout/`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
    });

    if (response.ok) {
        document.cookie = "csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.setItem("isLoggedIn", "false");
        removeLoggedInUser(userId);
        updateNavbar();
    } else {
        const { errors } = await response.json();
        console.error("❌ Logout failed:", errors);
    }
};


const setupProfilePageJs = async (userId) => {
    try {
        await fetchProfileData(userId);
        setupAvatarUpload(userId);
        setupButtons(userId);
        setupEditProfile(userId);
        setupMatchHistoryModal(userId);
    } catch (error) {
        console.error("❌ Error in setupProfilePage:", error);
    }
};


const fetchProfileData = async (userId) => {

    if (!userId) {
        console.error("❌ User ID not found in localStorage. Redirecting to login...");
        window.location.hash = "#login";
        return;
    }

    try {
        const response = await fetch(`/api/users/${userId}/`, {
            method: "GET",
            credentials: "include",
            headers: {
                "X-CSRFToken": await getCSRFCookie(),
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Failed to fetch profile data:", data.errors || response.status);
            
            if (response.status === 403 || response.status === 401) {
                alert("❌ You are not authorized. Redirecting to login.");
                //removeLoggedInUser(userId);
                window.location.hash = "#login";
            }
            return;
        }

        updateProfileUI(data);
    } catch (error) {
        console.error("❌ Error fetching profile data:", error);
    }
};



// Update profile UI elements
const updateProfileUI = (data) => {
    const fixieAvatarURL = (avatarPath) => {
        if (!avatarPath) {
            return "api/static/avatars/default.png";
        }
        if (avatarPath.startsWith("/media/")) {
            return `api${avatarPath}`;
        }
        return `api/${avatarPath}`;
    };
    const avatarUrl = fixieAvatarURL(data.avatar);
    const avatarEl = document.querySelector(".profile-avatar");
    const usernameEl = document.querySelector(".profile-username");
    const oldEmailEl = document.querySelector(".profile-email");


    if (avatarEl) {avatarEl.src = avatarUrl;}
    if (usernameEl) {usernameEl.textContent = data.username || "Username";}
    if (oldEmailEl) {oldEmailEl.remove();}

    // Conditionally insert email if it exists
    if (data.email && usernameEl) {
        const emailEl = document.createElement("p");
        emailEl.classList.add("profile-email");
        emailEl.textContent = data.email;
        usernameEl.insertAdjacentElement("afterend", emailEl);
    }
};



const setupMatchHistoryModal = (userId) => {
    const matchHistoryModal = document.getElementById("profile-match-history-modal");
    const closeMatchHistoryModalButton = document.getElementById("close-match-history-modal");
    const matchHistoryContainer = document.querySelector(".profile-match-history");
    const tournamentsContainer = document.querySelector(".profile-tournaments");
    const viewMatchHistoryButton = document.getElementById("profile-view-match-history-btn");

    viewMatchHistoryButton.addEventListener("click", async () => {
        const profileEditModal = document.getElementById("profile-edit-modal");
        profileEditModal.classList.remove("profile-edit-modal-visible");
        matchHistoryContainer.innerHTML = "<p>Loading match history...</p>";
        tournamentsContainer.innerHTML = "<p>Loading tournament data...</p>";
        matchHistoryModal.classList.add("profile-match-history-modal-visible");
        matchHistoryModal.classList.remove("profile-match-history-modal-hidden");
        
        await fetchMatchHistory();
        await fetchTournaments();
    });

    closeMatchHistoryModalButton.addEventListener("click", () => {
        matchHistoryModal.classList.remove("profile-match-history-modal-visible");
        matchHistoryModal.classList.add("profile-match-history-modal-hidden");
        matchHistoryContainer.innerHTML = "";
        tournamentsContainer.innerHTML = "";
    });

    matchHistoryModal.addEventListener("click", (event) => {
        if (event.target === matchHistoryModal) {
            matchHistoryModal.classList.remove("profile-match-history-modal-visible");
            matchHistoryModal.classList.add("profile-match-history-modal-hidden");
            matchHistoryContainer.innerHTML = "";
            tournamentsContainer.innerHTML = "";
        }
    });

    const fetchMatchHistory = async () => {
        if (!userId) {
            console.error("❌ User ID not found in localStorage.");
            return;
        }

        try {
            const csrfToken = await getCSRFCookie();
            const response = await fetch(`api/users/${userId}/match-history/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                credentials: "include"
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error fetching match history:", errorData.errors);
                matchHistoryContainer.innerHTML = `<p class="error-message">${errorData.errors}</p>`;
                return;
            }

            const data = await response.json();
            displayMatchHistory(data.match_history);
        } catch (error) {
            console.error("Network error fetching match history:", error);
            matchHistoryContainer.innerHTML = `<p class="error-message">Failed to load match history. Please try again.</p>`;
        }
    };

    const fetchTournaments = async () => {
        if (!userId) {
            console.error("❌ User ID not found in localStorage.");
            return;
        }

        try {
            const csrfToken = await getCSRFCookie();
            const response = await fetch(`api/users/${userId}/tournaments-history/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                credentials: "include"
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error fetching tournaments:", errorData.errors);
                tournamentsContainer.innerHTML = `<p class="error-message">${errorData.errors}</p>`;
                return;
            }

            const data = await response.json();
            displayTournaments(data.participated_tournaments);
        } catch (error) {
            console.error("Network error fetching tournaments:", error);
            tournamentsContainer.innerHTML = `<p class="error-message">Failed to load tournament data. Please try again.</p>`;
        }
    };

    const displayMatchHistory = (matches) => {
        if (matches.length === 0) {
            matchHistoryContainer.innerHTML = "<p>No match history found.</p>";
            return;
        }

        matchHistoryContainer.innerHTML = matches.map(match => `
            <div class="match-history-item">
                <p><strong>Game ID:</strong> ${match.game_id}</p>
                <p><strong>Date:</strong> ${new Date(match.date_played).toLocaleString()}</p>
                <p><strong>Players:</strong> ${match.player1} vs ${match.player2}</p>
                <p><strong>Winner:</strong> ${match.winner}</p>
                <p><strong>Score:</strong> ${match.player1_score} - ${match.player2_score}</p>
            </div>
        `).join("");
    };

    const displayTournaments = (tournaments) => {
        if (tournaments.length === 0) {
            tournamentsContainer.innerHTML = "<p>No tournament data found.</p>";
            return;
        }
    
        tournamentsContainer.innerHTML = tournaments.map(tournament => `
            <div class="tournament-item">
                <p><strong>Tournament ID:</strong> ${tournament.id}</p>
                <p><strong>Name:</strong> ${tournament.name}</p>
                <p><strong>Status:</strong> ${tournament.status}</p>
                <p><strong>Started At:</strong> ${tournament.started_at ? new Date(tournament.started_at).toLocaleString() : 'Not started'}</p>
                <p><strong>Players:</strong> ${tournament.players.join(", ")}</p>
                <p><strong>Winner:</strong> ${tournament.winner || 'No winner yet'}</p>
            </div>
        `).join("");
    };
};

// Function to handle account deletion
const handleAccountDeletion = async (userId) => {

    if (!userId) {
        alert("User not logged in.");
        return;
    }

    // Show confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");

    if (isConfirmed) {
        try {
            const csrfToken = await getCSRFCookie(); // If using CSRF protection
            const response = await fetch(`api/users/${userId}/`, {
                method: "DELETE",
                headers: { "X-CSRFToken": csrfToken },
                credentials: "include",
            });

            if (!response.ok) {
                const data = await response.json();
                alert("❌ Failed to delete account: " + (data.errors || "Unknown error"));
                return;
            }

            alert("✅ Account deleted successfully.");
            removeLoggedInUser(userId);
            window.location.hash = "#login";
        } catch (error) {
            console.error("❌ Error deleting account:", error);
            alert("❌ Error deleting account.");
        }
    }
};

const handleAnonymization  = async (userId) => {
  if (!userId) {
      console.error("⚠️ User ID not found.");
      alert("Error: Unable to anonymize personal data.");
      return;
  }

  const confirmation = confirm("Are you sure you want to anonymize your personal data? This cannot be undone, and your account will be unusable.");
  if (!confirmation) return;

  try {
      const response = await fetch(`api/users/${userId}/anonymize/`, {
          method: "PATCH",
          credentials: "include",
          headers: { "X-CSRFToken": await getCSRFCookie(), }
      });

      if (response.ok) {
          const data = await response.json();
          alert(`✅ ${data.message}`);
          localStorage.clear();
          window.location.hash = "#login";
      } else {
          const errorData = await response.json();
          alert(`❌ Error: ${errorData.errors || "Failed to anonymize personal data."}`);
      }
  } catch (error) {
      console.error("⚠️ Network or server error:", error);
      alert("An error occurred while anonymizing personal data.");
  }
};

// Button callbacks for profile page
const setupButtons = (userId) => {
    [
        { 
            selector: "#profile-logout-btn", 
            callback: () => { logoutUser(userId); window.location.hash = "#login";},
            message: "✅ Found logout button" 
        },
        { 
            selector: "#profile-menu-btn", 
            callback: () => {
                window.location.hash = "#menu";
            }, 
            message: "✅ Found menu button" 
        },
        { 
            selector: "#delete-account-btn", 
            callback: () => handleAccountDeletion(userId), 
            message: "✅ Found delete account button" 
        },
        { 
            selector: "#edit-profile-btn", 
            callback: () => {
                document.getElementById("profile-edit-modal").classList.add("profile-edit-modal-visible");
            }, 
            message: "✅ Found edit profile button" 
        },
        { 
            selector: "#anonymize-data-btn", 
            callback: () => handleAnonymization(userId), 
            message: "✅ Found anonymization button" 
        }
    ].forEach(({ selector, callback, message }) => {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener("click", callback);
        } else {
            console.warn(`⚠️ ${selector} not found.`);
        }
    });
};







// Setup for edit profile modal
const setupEditProfile = (userId) => {
    const editProfileBtn = document.getElementById("edit-profile-btn");
    const profileEditModal = document.getElementById("profile-edit-modal");
    const closeProfileModal = document.getElementById("close-profile-modal");
    const saveProfileBtn = document.getElementById("save-profile-btn");
    const savePasswordBtn = document.getElementById("save-password-btn");

    // Button to open edit profile modal
    editProfileBtn.addEventListener("click", async () => {
        const matchHistoryModal = document.getElementById("profile-match-history-modal");
        matchHistoryModal.classList.remove("profile-match-history-modal-visible");
        matchHistoryModal.classList.add("profile-match-history-modal-hidden");

        // Fetch profile data from API
        try {
            const csrfToken = await getCSRFCookie();
            const response = await fetch(`api/users/${userId}/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                credentials: "include",
            });

            if (!response.ok) {
                console.error("Failed to fetch profile data:", await response.json());
                alert("Failed to load profile data. Some fields may be empty.");
                // Fallback to empty strings
                document.getElementById("edit-username").value = document.querySelector(".profile-username")?.textContent || "";
                document.getElementById("edit-email").value = "";
                document.getElementById("edit-first-name").value = "";
                document.getElementById("edit-last-name").value = "";
            } else {
                const data = await response.json();
                document.getElementById("edit-username").value = data.username || "";
                document.getElementById("edit-email").value = data.email || "";
                document.getElementById("edit-first-name").value = data.first_name || "";
                document.getElementById("edit-last-name").value = data.last_name || "";
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
            alert("Error loading profile data. Some fields may be empty.");
            // Fallback to empty strings
            document.getElementById("edit-username").value = document.querySelector(".profile-username")?.textContent || "";
            document.getElementById("edit-email").value = "";
            document.getElementById("edit-first-name").value = "";
            document.getElementById("edit-last-name").value = "";
        }

        profileEditModal.classList.add("profile-edit-modal-visible");
    });

    closeProfileModal.addEventListener("click", () => {
        profileEditModal.classList.remove("profile-edit-modal-visible");
    });

    profileEditModal.addEventListener("click", (event) => {
        if (event.target === profileEditModal) {
            profileEditModal.classList.remove("profile-edit-modal-visible");
        }
    });

    // Save password button
    savePasswordBtn.addEventListener("click", async () => {
        if (!userId) {
            alert("User ID not found. Please log in again.");
            return;
        }
    
        // Get values from the input fields
        const oldPassword = document.getElementById("old-password").value;
        const newPassword1 = document.getElementById("new-password1").value;
        const newPassword2 = document.getElementById("new-password2").value;
        const errorMessage = document.getElementById("password-error-message");
    
        // Validate all fields are filled
        if (!oldPassword || !newPassword1 || !newPassword2) {
            errorMessage.textContent = "⚠️ All password fields are required.";
            errorMessage.style.display = "block";
            return;
        }
    
        try {
            const csrfToken = await getCSRFCookie();
            const response = await fetch(`api/users/${userId}/password/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password1: newPassword1,
                    new_password2: newPassword2,
                }),
                credentials: "include",
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                console.error("❌ Failed to update password:", data.errors);
                const errorMsg = data.errors?.new_password2?.[0] || data.errors?.new_password1?.[0] || data.errors?.old_password?.[0] || data.errors || "Unknown error";
                errorMessage.textContent = `❌ ${errorMsg}`;
                errorMessage.style.display = "block";
                return;
            }
    
            alert("✅ Password updated successfully!");
            errorMessage.style.display = "none";
            document.getElementById("old-password").value = "";
            document.getElementById("new-password1").value = "";
            document.getElementById("new-password2").value = "";
        } catch (error) {
            console.error("❌ Error updating password:", error);
            alert("❌ Error updating password. Please try again.");
        }
    });
    
    // Save profile button
    saveProfileBtn.addEventListener("click", async () => {
        if (!userId) {
            alert("User ID not found. Please log in again.");
            return;
        }

        const updatedData = {
            username: document.getElementById("edit-username").value,
            email: document.getElementById("edit-email").value,
            first_name: document.getElementById("edit-first-name").value,
            last_name: document.getElementById("edit-last-name").value,
        };

        try {
            const csrfToken = await getCSRFCookie();
            const response = await fetch(`api/users/${userId}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                body: JSON.stringify(updatedData),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("❌ Failed to update profile:", data.errors);
                alert("❌ Failed to update profile: " + (data.errors || "Unknown error"));
                return;
            }

            alert("✅ Profile updated successfully!");
            fetchProfileData(userId);
        } catch (error) {
            console.error("❌ Error updating profile:", error);
            alert("❌ Error updating profile.");
        }
    });
};

// Function to handle avatar upload
const setupAvatarUpload = (userId) => {

    const handleAvatarUpload = async (file) => {
        const formData = new FormData();
        formData.append("avatar", file);
    
        try {
            const csrfToken = await getCSRFCookie();
            const response = await fetch(`api/users/${userId}/avatar/`, {
                method: "POST",
                headers: { "X-CSRFToken": csrfToken },
                body: formData,
                credentials: "include",
            });
    
            
            if (!response.ok && response.status === 413) {
                // nginx handles this error instead of django
                alert("❌ File size is too large. Please upload a smaller file.");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                let errorMessage = "An error occurred while updating your avatar.";

                if (response.status === 400) {
                    if (data.errors && data.errors.avatar) {
                        errorMessage = data.errors.avatar[0];
                    } else {
                        errorMessage = "Bad Request: Invalid data provided.";
                    }
                }

                alert(`❌ ${errorMessage}`);
                return;
            }

            const newAvatarUrl = `api/${data.avatar_url}`;
    
            document.querySelector(".profile-avatar").src = newAvatarUrl;
            localStorage.setItem("user_avatar", newAvatarUrl);
        } catch (error) {
            console.error("❌ Error updating avatar:", error);
        }
    };

    const handleAvatarReset = async () => {
        try {
            const csrfToken = await getCSRFCookie();
            const response = await fetch(`api/users/${userId}/avatar/`, {
                method: "DELETE",
                headers: { "X-CSRFToken": csrfToken },
                credentials: "include",
            });

            const data = await response.json();
            if (!response.ok) {
                console.error("❌ Failed to reset avatar:", data.errors);
                return;
            }

            const newAvatarUrl = `api/${data.avatar_url}`;
            document.querySelector(".profile-avatar").src = newAvatarUrl;
            localStorage.setItem("user_avatar", newAvatarUrl);
        } catch (error) {
            console.error("❌ Error resetting avatar:", error);
        }
    };

    const avatarUpload = document.getElementById("avatar-upload");
    if (avatarUpload) {
        avatarUpload.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) handleAvatarUpload(file);
        });
    }

    const avatarResetButton = document.getElementById("avatar-reset");
    if (avatarResetButton) {
        avatarResetButton.addEventListener("click", handleAvatarReset);
    }
};

