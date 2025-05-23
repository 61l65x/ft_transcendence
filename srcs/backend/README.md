# API Documentation

A brief description of the API and example responses.

## Base URL

http://localhost:8000/api/

## Endpoints

### Admin panel

Access the Django Admin interface for managing the system and users.

<code>GET</code><code><b>admin/</b></code>

---

### User registration

Register a new user in the system.

<details>
    <summary><code>POST</code><code><b>users/register/</b></code></summary>

- **Expected Request Body**:
  ```json
  {
    "username": "user1",
    "password1": "securepassword123",
    "password2": "securepassword123"
  }
  ```
- **Response**
  - **201**
    ```json
    {
      "id": 1,
      "username": "user1",
      "message": "User created."
    }
    ```
  - **400**
    ```json
    { "errors": { "username": ["A user with that username already exists."] } }
    ```
    ```json
    { "errors": { "password2": ["The two password fields didn’t match."] } }
    ```
    ```json
    {
      "errors": {
        "password2": [
          "This password is too short. It must contain at least 8 characters.",
          "This password is too common.",
          "This password is entirely numeric."
        ]
      }
    }
    ```

</details>

---

### User login

Authenticate a user and logs them in. If a user fails to log in with incorrect credentials 5 times in a row, their account will be temporarily locked for 15 minutes to prevent brute-force attacks.

<details>
    <summary><code>POST</code><code><b>users/login/</b></code></summary>

- **Expected Request Body**:
  ```json
  {
    "username": "user1",
    "password": "securepassword123"
  }
  ```
- **Response**
  - **200**
    ```json
    {
      "id": 1,
      "username": "user1",
      "message": "Login successful."
    }
    ```
  - **400**
    ```json
    { "errors": "User is already authenticated." }
    ```
  - **401**
    ```json
    { "errors": "Invalid password." }
    ```
    ```json
    { "errors": "Username does not exist." }
    ```
    ```json
    { "errors": "Username and password are required." }
    ```
  - **403**
    - When the user fails to log in due to incorrect credentials 5 times in a row
      ```json
      { "error": "Locked out due to too many login failures." }
      ```

</details>

---

### User logout

For the currently authenticated user to log out.

<details>
    <summary><code>POST</code><code><b>users/{user_id}/logout/</b></code></summary>

- **Response**
  - **200**
    ```json
    {
      "id": 1,
      "username": "user1",
      "message": "Logout successful."
    }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### User avatar upload

Allow users to upload a new avatar image.

<details>
    <summary><code>POST</code><code><b>users/{user_id}/avatar/</b></code></summary>

- **Expected Request Body**:
  The request should be a `multipart/form-data` request with the following field:
  `avatar: The avatar image file (JPG, JPEG, PNG) to be uploaded.`
- **Response**
  - **200**
    ```json
    {
      "id": 1,
      "username": "user1",
      "message": "Avatar updated.",
      "avatar_url": "/media/avatars/1/<filename>"
    }
    ```
  - **400**
    - When the file extension is not allowed
      ```json
      {
        "errors": {
          "avatar": [
            "File extension “gif” is not allowed. Allowed extensions are: jpg, jpeg, png."
          ]
        }
      }
      ```
    - When the file size exceeds the limit
      ```json
      {
        "errors": {
          "avatar": ["File size exceeds the limit <MAX_FILE_SIZE> MB."]
        }
      }
      ```
    - When no file is uploaded
      ```json
      { "errors": "No file uploaded." }
      ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### User avatar reset

Allow users to reset their avatar to default one.

<details>
    <summary><code>DELETE</code><code><b>users/{user_id}/avatar/</b></code></summary>

- **Response**
  - **200**
    ```json
    {
      "id": 1,
      "username": "user1",
      "message": "Avatar reset.",
      "avatar_url": "/static/avatars/default.png"
    }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### User profile info

Get details of the authenticated user's profile.

<details>
    <summary><code>GET</code><code><b>users/{user_id}/</b></code></summary>

- **Response**
  - **200**
    ```json
    {
      "id": 1,
      "username": "user1",
      "avatar": "/media/avatars/1/<filename>",
      "email": "...",
      "first_name": "...",
      "last_name": "...",
      "total_wins": 10,
      "total_losses": 5
    }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### User profile update

Update details of the authenticated user's profile, include username, email, first_name, last_name.

<details>
    <summary><code>PATCH</code><code><b>users/{user_id}/</b></code></summary>

- **Expected Request Body**:
  ```json
  {
    "username": "test_update",
    "email": "test_update@email.com",
    "first_name": "test_update",
    "last_name": "test_update"
  }
  ```
- **Response**
  - **200**
    ```json
    {
      "id": 1,
      "username": "test_update",
      "message": "User profile updated."
    }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### User password update

Update the password of the authenticated user.

<details>
    <summary><code>POST</code><code><b>users/{user_id}/password/</b></code></summary>

- **Expected Request Body**:
  ```json
  {
    "old_password": "securepassword123",
    "new_password1": "securepassword456",
    "new_password2": "securepassword456"
  }
  ```
- **Response**
  - **200**
    ```json
    {
      "id": 1,
      "username": "user1",
      "message": "User password updated."
    }
    ```
  - **400**
    ```json
    {
      "errors": {
        "new_password2": ["The two password fields didn’t match."]
      }
    }
    ```
    ```json
    {
      "errors": {
        "new_password1": ["New password cannot be the same as the old one."]
      }
    }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### User account deletion

For the authenticated user to delete its account. In this case, user object and related data will be deleted from the database.

<details>
    <summary><code>DELETE</code><code><b>users/{user_id}/</b></code></summary>

- **Response**
  - **200**
    ```json
    {
      "id": 1,
      "username": "user1",
      "message": "Account deleted."
    }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### Anonymization

Enable users to request anonymization of their personal data, ensuring that their identity and sensitive information are protected. The following actions are taken upon a successful request:

- username and email anonymized;
- first and last names become empty strings;
- avatar reset to default and existing avatar deleted if it exists;
- friends removed;
- user is logged out and may not log in again.

<details>
    <summary><code>PATCH</code><code><b>users/{user_id}/anonymize/</b></code></summary>

- **Response**
  - **200**
    ```json
    { "message": "Your data has been anonymized. Logging out..." }
    ```
  - **400**
    ```json
    { "errors": "User is already anonymized." }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### Participated tournaments

For the authenticated user to view their participated tournaments related info, including id, name, status, started_at, players.

<details>
    <summary><code>GET</code><code><b>users/{user_id}/tournaments-history/</b></code></summary>

- **Response**
  - **200**
    ```json
    {
        "participated_tournaments": [
            {
                "id": 1,
                "name": "Player1's game",
                "status": "PENDING",
                "started_at": null,
                "players": [
                    "user1",
                    "user2",
                    "user3"
                ],
                "winner": "user1",
            }
            "... more items ..."
        ]
    }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### Match history

For the authenticated user to view their match history including date, winner, players and their scores.

<details>
    <summary><code>GET</code><code><b>users/{user_id}/match-history/</b></code></summary>

- **Response**
  - **200**
    ```json
    {
        "match_history": [
            {
                "game_id": 2,
                "date_played": "YYYY-MM-DDTHH:MM:SS.sssZ",
                "player1:": "user1",
                "player2": "user2",
                "winner": "user2",
                "player1_score": 7,
                "player2_score": 10
            },
            {
                "game_id": 1,
                "date_played": "YYYY-MM-DDTHH:MM:SS.sssZ",
                "player1:": "user1",
                "player2": "user2",
                "winner": "user1",
                "player1_score": 10,
                "player2_score": 8
            }
            "... more items ..."
        ]
    }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### User scores

Get sum of the scores of all games played by the user, as well as the number of games played.

<details>
    <summary><code>GET</code><code><b>users/{user_id}/scores/</b></code></summary>

- **Response**
  - **200**
    ```json
    {
      "sum_of_scores": 100,
      "total_games": 10
    }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### Leaderboard

Get basic user info and game stats for all users.

<details>
    <summary><code>GET</code><code><b>users/leaderboard/</b></code></summary>

- **Response**
  - **200**
    ```json
    [
        {
            "id": 1,
            "username": "user1",
            "avatar": "/media/avatars/1/<filename>",
            "total_wins": 10,
            "win_rate": 75.0,
            "rank": 1,
        },
        {
            "id": 2,
            "username": "user2",
            "avatar": "/media/avatars/2/<filename>",
            "total_wins": 10,
            "win_rate": 50.0,
            "rank": 2,
        }
        "... more items ..."
    ]
    ```

</details>

---

### Heartbeat for online status

Update the last active timestamp of the user to track their online status.

<details>
    <summary>
        <code>GET</code>
        <code><b>users/{user_id}/heartbeat/</b></code>
    </summary>

- **Response**
  - **200**
    ```json
    { "message": "Heartbeat updated." }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### Listing friends

List all the friends of currently authenticated user.

<details>
    <summary>
        <code>GET</code>
        <code><b>users/{user_id}/friends/</b></code>
    </summary>

- **Response**
  - **200**
    ```json
    {
        "friends": [
            {
                "id": 2,
                "username": "user2",
                "avatar": "/media/avatars/2/<filename>"
            }
            "... more items ..."
        ]
    }
    ```
  - **401**
    - When the user is not authenticated
      ```json
      { "errors": "User is not authenticated." }
      ```

</details>

---

### Friend request

Send a friend request to another user. The recipient username is passed as a query parameter.

<details>
    <summary>
        <code>POST</code>
        <code><b>users/{user_id}/friends/requests/?recipient_username={recipient_username}</b></code>
    </summary>

- **Response**
  - **201**
    ```json
    { "message": "Friend request sent." }
    ```
  - **400**
    - When the user_id in url matches the authenticated user's id
      ```json
      { "errors": "You cannot send a friend request to yourself." }
      ```
    - When no recipient_username query param is passed
      ```json
      { "errors": "Missing recipient_username query parameter." }
      ```
    - When the same request has been sent earlier
      ```json
      { "errors": "Friend request already sent." }
      ```
    - When recipient is already a friend of the user
      ```json
      { "errors": "Already friends with this user." }
      ```
  - **401**
    - When the user is not authenticated
      ```json
      { "errors": "User is not authenticated." }
      ```
  - **404**
    - When the recipient's id does not exist in database
      ```json
      { "errors": "Recipient of the friend request not found." }
      ```

</details>

---

### Listing friend requests

List all the pending friend requests received by the authenticated user.

<details>
    <summary>
        <code>GET</code>
        <code><b>users/{user_id}/friends/requests/</b></code>
    </summary>

- **Response**
  - **200**
    ```json
    {
        "friend_requests": [
            {
                "id": 1,
                "sender": "user1",
                "sent at": "YYYY-MM-DDTHH:MM:SS.sssZ"
            }
            "... more items ..."
        ]
    }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### Friend request handling

Accept or reject a friend request.

<details>
    <summary>
        <code>POST</code>
        <code><b>users/{user_id}/friends/requests/{request_id}/</b></code>
    </summary>

- **Expected Request Body**:
  ```json
  { "accepted": true }
  ```
  - `accepted` (**boolean**): Can be **true** or **false** depending on whether the user accepts or rejects.
- **Response**
  - **200**
    ```json
    { "message": "Friend request accepted/rejected." }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```
  - **404**
    ```json
    { "errors": "friend request not found" }
    ```

</details>

---

### Friend removal

Unfriend someone.

<details>
    <summary>
        <code>DELETE</code>
        <code><b>users/{user_id}/friends/requests/{request_id}/</b></code>
    </summary>

- **Response**
  - **204**
  - **400**
    ```json
    { "errors": "Not friends with this user(id=5)." }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### Local 1v1 game creation against guest player

Create a local 1v1 game for a logged-in user (id as path parameter)

<details>
    <summary>
        <code>POST</code>
        <code><b>users/{user_id}/games/local/guest/</b></code>
    </summary>

- **Response**
  - **201**
    ```json
    {
      "message": "Local game created.",
      "game_id": 1
    }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### Local 1v1 game creation against another logged-in user

Create a local 1v1 game for user1 (id as path parameter) and user2 (id as query parameter).

<details>
    <summary>
        <code>POST</code>
        <code><b>users/{user_id}/games/local/?user_id={user_id}</b></code>
    </summary>

- **Response**
  - **201**
    ```json
    {
      "message": "Local game created.",
      "game_id": 1
    }
    ```
  - **400**
    ```json
    { "errors": "player1 and player2 cannot be the same user." }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### Local AI game creation

Create a local 1v1 game against AI for a logged-in user.

<details>
    <summary>
        <code>POST</code>
        <code><b>users/{user_id}/games/ai/</b></code>
    </summary>

- **Response**
  - **201**
    ```json
    {
      "message": "AI game created.",
      "game_id": 2
    }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### Saving game stats

Save the stats for a completed game for a logged-in user.

<details>
    <summary>
        <code>PATCH</code>
        <code><b>users/{user_id}/games/{game_id}/stats/</b></code>
    </summary>

- **Expected Request Body**:
  ```json
  {
    "player1_score": 6,
    "player2_score": 10
  }
  ```
- **Response**
  - **200**
    ```json
    { "message": "Game stats saved." }
    ```
  - **400**
    - When the data in Json payload is malformed
      ```json
      { "errors": "Invalid JSON input." }
      ```
    - When errors occur during the form validation
      ```json
      {
        "errors": {
          "player2_score": ["This field is required."]
        }
      }
      ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```
  - **403**
    - When the logged-in user is not a player of the game
      ```json
      { "errors": "You are not part of this game." }
      ```
  - **404**
    ```json
    { "errors": "Game not found." }
    ```

</details>

---

### Tournament creation

Create a tournament.

<details>
    <summary>
        <code>POST</code>
        <code><b>tournaments/?user_id={user_id}</b></code>
    </summary>

- **Expected Request Body**:
  ```json
  {
    "tournament_name": "",
  }
  ```
- **Response**
  - **201**
    ```json
    {
      "message": "{user's username} created tournament.",
      "tournament_id": 1,
      "tournament_name": "{user's username}'s tournament"
    }
    ```
  - **400**
    - When the data in Json payload is malformed
      ```json
      { "errors": "Invalid JSON input." }
      ```
    - When user_id is not passed as query param
      ```json
      { "errors": "Missing user_id query parameter." }
      ```
    - When invalid user_id is passed, e.g. a string
      ```json
      { "errors": "Invalid user_id value passed in query param." }
      ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```

</details>

---

### Tournament joining

Join a tournament.

<details>
    <summary>
        <code>PATCH</code>
        <code><b>tournaments/{id}/players/?user_id={user_id}</b></code>
    </summary>

- **Response**
  - **200**
    ```json
    {
      "message": "{user's username} joined tournament.",
      "tournament_id": 1,
      "tournament_name": "{creator's username}'s tournament"
    }
    ```
  - **400**
    ```json
    { "errors": "Missing user_id query parameter." }
    ```
    ```json
    { "errors": "Invalid user_id value passed in query param." }
    ```
    ```json
    { "errors": "['Tournament has already started/completed.']" }
    ```
    ```json
    { "errors": "['Tournament is full']" }
    ```
    ```json
    { "errors": "['You are already in this tournament.']" }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```
  - **404**
    ```json
    { "errors": "Tournament not found with tournament_id {tournament_id}." }
    ```

</details>

---

### Tournament commencement

Start a tournament.

<details>
    <summary>
        <code>PATCH</code>
        <code><b>tournaments/{id}/start/?user_id={user_id}</b></code>
    </summary>

- **Response**
  - **200**
    ```json
    {
      "message": "Tournament started.",
      "tournament_id": 1,
      "tournament_name": "{creator's username}'s tournament"
    }
    ```
  - **400**
    ```json
    { "errors": "Missing user_id query parameter." }
    ```
    ```json
    { "errors": "Invalid user_id value passed in query param." }
    ```
    ```json
    { "errors": "['Tournament has already started/completed.']" }
    ```
    ```json
    { "errors": "['Cannot start tournament with less than 3 players.']" }
    ```
    ```json
    { "errors": "['Only tournament players can start the tournament.']" }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```
  - **404**
    ```json
    { "errors": "Tournament not found with tournament_id {tournament_id}." }
    ```

</details>

---

### Tournament stats saving

Save the stats of a completed tournament.

<details>
    <summary>
        <code>PATCH</code>
        <code><b>tournaments/{id}/stats/?user_id={user_id}</b></code>
    </summary>

- **Expected Request Body**:
  ```json
  { "winner_id": 2 }
  ```
- **Response**
  - **200**
    ```json
    {
      "message": "Tournament stats saved.",
      "tournament_id": 1,
      "tournament_name": "{creator's username}'s tournament"
    }
    ```
  - **400**
    ```json
    { "errors": "Invalid JSON input." }
    ```
    ```json
    { "errors": "Missing winner_id field in request body." }
    ```
    ```json
    { "errors": "Missing user_id query parameter." }
    ```
    ```json
    { "errors": "Invalid user_id value passed in query param." }
    ```
    ```json
    { "errors": "['Only tournament players can save stats.']" }
    ```
    ```json
    { "errors": "['Tournament is not active.']" }
    ```
    ```json
    { "errors": "['Winner must be a player in the tournament.']" }
    ```
  - **401**
    ```json
    { "errors": "User is not authenticated." }
    ```
  - **404**
    ```json
    { "errors": "Tournament not found with tournament_id {tournament_id}." }
    ```
    ```json
    { "errors": "Winner not found with winner_id {winner_id}." }
    ```

</details>

---

### Get guest player id

<details>
    <summary>
        <code>GET</code>
        <code><b>get-guest-id/</b></code>
    </summary>

- **Response**
  - **200**
    ```json
    { "id": 1 }
    ```
  - **404**
    ```json
    { "errors": "Guest player not found." }
    ```

</details>

---

### Get data of all logged-in users

<details>
    <summary>
        <code>GET</code>
        <code><b>users/</b></code>
    </summary>

- **Response**
  - **200**
    ```json
    {
      "users": [
        {
          "id": 3,
          "username": "test1"
        },
        {
          "id": 4,
          "username": "test2"
        },
        "... more items ..."
      ]
    }
    ```

</details>
