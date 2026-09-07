const pool = require('../db');

const getStatistics = async (req, res) => {
  try {

    /*
     * ============================================================
     * 1. IGRE PO IGRAČU
     * ============================================================
     */

    const gameStatsResult = await pool.query(`
      WITH player_games AS (
        SELECT
          gp.user_id,
          gp.game_id,
          gp.team,
          g.player_count,

          g.team1_party_wins,
          g.team2_party_wins,
          g.team3_party_wins,

          CASE

            -- 2 ili 4 igrača
            WHEN g.player_count IN (2, 4)
              AND (
                (gp.team = 1
                  AND g.team1_party_wins > g.team2_party_wins)

                OR

                (gp.team = 2
                  AND g.team2_party_wins > g.team1_party_wins)
              )
            THEN true

            -- 3 igrača
            WHEN g.player_count = 3
              AND (
                (gp.team = 1
                  AND g.team1_party_wins > g.team2_party_wins
                  AND g.team1_party_wins > g.team3_party_wins)

                OR

                (gp.team = 2
                  AND g.team2_party_wins > g.team1_party_wins
                  AND g.team2_party_wins > g.team3_party_wins)

                OR

                (gp.team = 3
                  AND g.team3_party_wins > g.team1_party_wins
                  AND g.team3_party_wins > g.team2_party_wins)
              )
            THEN true

            ELSE false
          END AS game_won,

          CASE

            -- 2 ili 4 igrača
            WHEN g.player_count IN (2, 4)
              AND (
                (gp.team = 1
                  AND g.team1_party_wins < g.team2_party_wins)

                OR

                (gp.team = 2
                  AND g.team2_party_wins < g.team1_party_wins)
              )
            THEN true

            -- 3 igrača
            WHEN g.player_count = 3
              AND (
                (gp.team = 1
                  AND g.team1_party_wins < GREATEST(
                    g.team2_party_wins,
                    g.team3_party_wins
                  ))

                OR

                (gp.team = 2
                  AND g.team2_party_wins < GREATEST(
                    g.team1_party_wins,
                    g.team3_party_wins
                  ))

                OR

                (gp.team = 3
                  AND g.team3_party_wins < GREATEST(
                    g.team1_party_wins,
                    g.team2_party_wins
                  ))
              )
            THEN true

            ELSE false
          END AS game_lost

        FROM game_players gp

        INNER JOIN games g
          ON g.id = gp.game_id
      )

      SELECT
        user_id,

        COUNT(*) AS games_played,

        COUNT(*) FILTER (
          WHERE game_won = true
        ) AS games_won,

        COUNT(*) FILTER (
          WHERE game_lost = true
        ) AS games_lost,

        COUNT(*) FILTER (
          WHERE player_count = 2
        ) AS games_2,

        COUNT(*) FILTER (
          WHERE player_count = 3
        ) AS games_3,

        COUNT(*) FILTER (
          WHERE player_count = 4
        ) AS games_4,

        COUNT(*) FILTER (
          WHERE player_count = 2
            AND game_won = true
        ) AS wins_2,

        COUNT(*) FILTER (
          WHERE player_count = 3
            AND game_won = true
        ) AS wins_3,

        COUNT(*) FILTER (
          WHERE player_count = 4
            AND game_won = true
        ) AS wins_4,

        COUNT(*) FILTER (
          WHERE player_count = 2
            AND game_lost = true
        ) AS losses_2,

        COUNT(*) FILTER (
          WHERE player_count = 3
            AND game_lost = true
        ) AS losses_3,

        COUNT(*) FILTER (
          WHERE player_count = 4
            AND game_lost = true
        ) AS losses_4

      FROM player_games

      GROUP BY user_id
    `);


    /*
     * ============================================================
     * 2. PARTIJE
     * ============================================================
     */

    const partyStatsResult = await pool.query(`
      SELECT
        gp.user_id,

        COUNT(p.id) AS parties_played,

        COUNT(p.id) FILTER (
          WHERE p.winning_team = gp.team
        ) AS parties_won,

        COUNT(p.id) FILTER (
          WHERE g.player_count = 2
        ) AS parties_2,

        COUNT(p.id) FILTER (
          WHERE g.player_count = 3
        ) AS parties_3,

        COUNT(p.id) FILTER (
          WHERE g.player_count = 4
        ) AS parties_4,

        COUNT(p.id) FILTER (
          WHERE g.player_count = 2
            AND p.winning_team = gp.team
        ) AS parties_won_2,

        COUNT(p.id) FILTER (
          WHERE g.player_count = 3
            AND p.winning_team = gp.team
        ) AS parties_won_3,

        COUNT(p.id) FILTER (
          WHERE g.player_count = 4
            AND p.winning_team = gp.team
        ) AS parties_won_4

      FROM game_players gp

      INNER JOIN games g
        ON g.id = gp.game_id

      INNER JOIN parties p
        ON p.game_id = g.id

      GROUP BY gp.user_id
    `);


    /*
     * ============================================================
     * 3. RUNDE
     * ============================================================
     */

    const roundStatsResult = await pool.query(`
      WITH player_rounds AS (

        SELECT
          gp.user_id,
          gp.team,
          g.player_count,
          r.id AS round_id,

          r.caller_user_id,
          r.failed,
          r.stiglja,
          r.stiglja_team,

          CASE

            WHEN gp.team = 1
              THEN r.team1_total

            WHEN gp.team = 2
              THEN r.team2_total

            WHEN gp.team = 3
              THEN r.team3_total

            ELSE 0

          END AS player_points

        FROM game_players gp

        INNER JOIN games g
          ON g.id = gp.game_id

        INNER JOIN parties p
          ON p.game_id = g.id

        INNER JOIN rounds r
          ON r.party_id = p.id
      )

      SELECT

        user_id,

        COUNT(round_id) AS rounds_played,

        COALESCE(
          SUM(player_points),
          0
        ) AS total_points,

        COUNT(round_id) FILTER (
          WHERE caller_user_id = user_id
        ) AS calls,

        COUNT(round_id) FILTER (
          WHERE caller_user_id = user_id
            AND failed = false
        ) AS successful_calls,

        COUNT(round_id) FILTER (
          WHERE caller_user_id = user_id
            AND failed = true
        ) AS failed_calls,

        COUNT(round_id) FILTER (
          WHERE stiglja = true
            AND stiglja_team = team
        ) AS stiglje,

        COUNT(round_id) FILTER (
          WHERE player_count = 2
        ) AS rounds_2,

        COUNT(round_id) FILTER (
          WHERE player_count = 3
        ) AS rounds_3,

        COUNT(round_id) FILTER (
          WHERE player_count = 4
        ) AS rounds_4,

        COALESCE(
          SUM(player_points) FILTER (
            WHERE player_count = 2
          ),
          0
        ) AS points_2,

        COALESCE(
          SUM(player_points) FILTER (
            WHERE player_count = 3
          ),
          0
        ) AS points_3,

        COALESCE(
          SUM(player_points) FILTER (
            WHERE player_count = 4
          ),
          0
        ) AS points_4,

        COUNT(round_id) FILTER (
          WHERE player_count = 2
            AND caller_user_id = user_id
        ) AS calls_2,

        COUNT(round_id) FILTER (
          WHERE player_count = 3
            AND caller_user_id = user_id
        ) AS calls_3,

        COUNT(round_id) FILTER (
          WHERE player_count = 4
            AND caller_user_id = user_id
        ) AS calls_4,

        COUNT(round_id) FILTER (
          WHERE player_count = 2
            AND caller_user_id = user_id
            AND failed = false
        ) AS successful_calls_2,

        COUNT(round_id) FILTER (
          WHERE player_count = 3
            AND caller_user_id = user_id
            AND failed = false
        ) AS successful_calls_3,

        COUNT(round_id) FILTER (
          WHERE player_count = 4
            AND caller_user_id = user_id
            AND failed = false
        ) AS successful_calls_4,

        COUNT(round_id) FILTER (
          WHERE player_count = 2
            AND caller_user_id = user_id
            AND failed = true
        ) AS failed_calls_2,

        COUNT(round_id) FILTER (
          WHERE player_count = 3
            AND caller_user_id = user_id
            AND failed = true
        ) AS failed_calls_3,

        COUNT(round_id) FILTER (
          WHERE player_count = 4
            AND caller_user_id = user_id
            AND failed = true
        ) AS failed_calls_4,

        COUNT(round_id) FILTER (
          WHERE player_count = 2
            AND stiglja = true
            AND stiglja_team = team
        ) AS stiglje_2,

        COUNT(round_id) FILTER (
          WHERE player_count = 3
            AND stiglja = true
            AND stiglja_team = team
        ) AS stiglje_3,

        COUNT(round_id) FILTER (
          WHERE player_count = 4
            AND stiglja = true
            AND stiglja_team = team
        ) AS stiglje_4

      FROM player_rounds

      GROUP BY user_id
    `);


    /*
     * ============================================================
     * 4. ZVANJA
     * ============================================================
     */

    const bidStatsResult = await pool.query(`
      SELECT
        rb.user_id,

        COUNT(rb.id) AS bids,

        COALESCE(
          SUM(rb.points),
          0
        ) AS bid_points,

        COUNT(rb.id) FILTER (
          WHERE g.player_count = 2
        ) AS bids_2,

        COUNT(rb.id) FILTER (
          WHERE g.player_count = 3
        ) AS bids_3,

        COUNT(rb.id) FILTER (
          WHERE g.player_count = 4
        ) AS bids_4,

        COALESCE(
          SUM(rb.points) FILTER (
            WHERE g.player_count = 2
          ),
          0
        ) AS bid_points_2,

        COALESCE(
          SUM(rb.points) FILTER (
            WHERE g.player_count = 3
          ),
          0
        ) AS bid_points_3,

        COALESCE(
          SUM(rb.points) FILTER (
            WHERE g.player_count = 4
          ),
          0
        ) AS bid_points_4

      FROM round_bids rb

      INNER JOIN rounds r
        ON r.id = rb.round_id

      INNER JOIN parties p
        ON p.id = r.party_id

      INNER JOIN games g
        ON g.id = p.game_id

      GROUP BY rb.user_id
    `);


    /*
     * ============================================================
     * 5. SPOJIMO SVE STATISTIKE
     * ============================================================
     */

    const usersResult = await pool.query(`
      SELECT
        id,
        username
      FROM users
      ORDER BY username ASC
    `);


    const gameMap = new Map();

    for (const row of gameStatsResult.rows) {
      gameMap.set(row.user_id, row);
    }


    const partyMap = new Map();

    for (const row of partyStatsResult.rows) {
      partyMap.set(row.user_id, row);
    }


    const roundMap = new Map();

    for (const row of roundStatsResult.rows) {
      roundMap.set(row.user_id, row);
    }


    const bidMap = new Map();

    for (const row of bidStatsResult.rows) {
      bidMap.set(row.user_id, row);
    }


    /*
     * Helper za izradu statistike
     */

    const createModeStats = (
      gamesPlayed,
      gamesWon,
      gamesLost,
      partiesPlayed,
      partiesWon,
      roundsPlayed,
      totalPoints,
      calls,
      successfulCalls,
      failedCalls,
      bids,
      bidPoints,
      stiglje
    ) => {

      gamesPlayed = Number(gamesPlayed || 0);
      gamesWon = Number(gamesWon || 0);
      gamesLost = Number(gamesLost || 0);

      return {

        gamesPlayed,

        gamesWon,

        gamesLost,

        winRate:
          gamesPlayed > 0
            ? Number(
                (
                  (gamesWon / gamesPlayed) * 100
                ).toFixed(1)
              )
            : 0,

        partiesPlayed:
          Number(partiesPlayed || 0),

        partiesWon:
          Number(partiesWon || 0),

        roundsPlayed:
          Number(roundsPlayed || 0),

        totalPoints:
          Number(totalPoints || 0),

        calls:
          Number(calls || 0),

        successfulCalls:
          Number(successfulCalls || 0),

        failedCalls:
          Number(failedCalls || 0),

        bids:
          Number(bids || 0),

        bidPoints:
          Number(bidPoints || 0),

        stiglje:
          Number(stiglje || 0)
      };
    };


    /*
     * ============================================================
     * 6. REZULTAT ZA SVAKOG IGRAČA
     * ============================================================
     */

    const players = usersResult.rows.map(user => {

      const games = gameMap.get(user.id) || {};
      const parties = partyMap.get(user.id) || {};
      const rounds = roundMap.get(user.id) || {};
      const bids = bidMap.get(user.id) || {};


      const overall = createModeStats(

        games.games_played,

        games.games_won,

        games.games_lost,

        parties.parties_played,

        parties.parties_won,

        rounds.rounds_played,

        rounds.total_points,

        rounds.calls,

        rounds.successful_calls,

        rounds.failed_calls,

        bids.bids,

        bids.bid_points,

        rounds.stiglje
      );


      const twoPlayers = createModeStats(

        games.games_2,

        games.wins_2,

        games.losses_2,

        parties.parties_2,

        parties.parties_won_2,

        rounds.rounds_2,

        rounds.points_2,

        rounds.calls_2,

        rounds.successful_calls_2,

        rounds.failed_calls_2,

        bids.bids_2,

        bids.bid_points_2,

        rounds.stiglje_2
      );


      const threePlayers = createModeStats(

        games.games_3,

        games.wins_3,

        games.losses_3,

        parties.parties_3,

        parties.parties_won_3,

        rounds.rounds_3,

        rounds.points_3,

        rounds.calls_3,

        rounds.successful_calls_3,

        rounds.failed_calls_3,

        bids.bids_3,

        bids.bid_points_3,

        rounds.stiglje_3
      );


      const fourPlayers = createModeStats(

        games.games_4,

        games.wins_4,

        games.losses_4,

        parties.parties_4,

        parties.parties_won_4,

        rounds.rounds_4,

        rounds.points_4,

        rounds.calls_4,

        rounds.successful_calls_4,

        rounds.failed_calls_4,

        bids.bids_4,

        bids.bid_points_4,

        rounds.stiglje_4
      );


      return {

        id: user.id,

        username: user.username,

        overall,

        twoPlayers,

        threePlayers,

        fourPlayers
      };
    });


    /*
     * ============================================================
     * 7. GLOBALNI PODACI
     * ============================================================
     */

    const summaryResult = await pool.query(`
      SELECT

        COUNT(*) AS total_games,

        COUNT(*) FILTER (
          WHERE player_count = 2
        ) AS games_2,

        COUNT(*) FILTER (
          WHERE player_count = 3
        ) AS games_3,

        COUNT(*) FILTER (
          WHERE player_count = 4
        ) AS games_4,

        (
          SELECT COUNT(*)
          FROM parties
        ) AS total_parties,

        (
          SELECT COUNT(*)
          FROM rounds
        ) AS total_rounds

      FROM games
    `);


    const summary = summaryResult.rows[0];


    res.json({

      summary: {

        totalGames:
          Number(summary.total_games),

        totalParties:
          Number(summary.total_parties),

        totalRounds:
          Number(summary.total_rounds),

        games2Players:
          Number(summary.games_2),

        games3Players:
          Number(summary.games_3),

        games4Players:
          Number(summary.games_4)
      },

      players

    });

  } catch (error) {

    console.error(
      'Greška kod dohvaćanja statistike:',
      error
    );

    res.status(500).json({

      message:
        'Greška kod dohvaćanja statistike.'

    });
  }
};


module.exports = {
  getStatistics
};