const express = require("express");
const path = require("path");

const app = express();
module.exports = app;
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Express Server is Running");
    });
  } catch (e) {
    console.log(`Error Message: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getQuery = `SELECT player_id as playerId,
  player_name as playerName FROM player_details;`;
  let list1 = await db.all(getQuery);
  response.send(list1);
});

app.get("/players/:playersId/", async (request, response) => {
  const { playersId } = request.params;
  const getLiQuery = `SELECT player_id as playerId,
  player_name as playerName FROM player_details WHERE player_id = ${playersId};`;
  let player1 = await db.get(getLiQuery);
  response.send(player1);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  let player = request.body;
  const { playerName } = player;
  const putQuery = `UPDATE player_details SET
  player_name = '${playerName}' WHERE player_id = ${playerId}`;
  await db.run(putQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatQuery = `SELECT match_id as matchId, match, year FROM match_details where match_id = ${matchId};`;
  const match = await db.get(getMatQuery);
  response.send(match);
});

///5Inner jOin
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlLiQuery = `SELECT player_match_score.match_id as matchId,
  match_details.match, match_details.year
   FROM match_details  INNER JOIN player_match_score ON match_details.match_id = player_match_score.match_id
   WHERE player_match_score.player_id = ${playerId};`;
  let player2 = await db.all(getPlLiQuery);
  response.send(player2);
});

///6Inner Join
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlLiQuery = `SELECT player_details.player_id as playerId,
  player_details.player_name as playerName
   FROM player_details  INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
   WHERE player_match_score.match_id = ${matchId};`;
  let player2 = await db.all(getPlLiQuery);
  response.send(player2);
});

///7join
app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getPlLiQuery = `SELECT player_details.player_id as playerId,
  player_details.player_name as playerName,
  sum(player_match_score.score) as totalScore, sum(player_match_score.fours) as totalFours,
  sum(player_match_score.sixes) as totalSixes
   FROM player_details  INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
   WHERE player_match_score.player_id = ${playerId};`;
  let playerS = await db.get(getPlLiQuery);
  response.send(playerS);
});
