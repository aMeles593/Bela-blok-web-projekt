const pool = require('../db');

const getStatistics = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        u.id,
        u.username,

        COUNT(DISTINCT gp.game_id) AS games_played,

        COUNT(DISTINCT CASE
          WHEN
            (gp.team = 1 AND g.team1_party_wins > g.team2_party_wins)
            OR
            (gp.team = 2 AND g.team2_party_wins > g.team1_party_wins)
          THEN gp.game_id
        END) AS games_won,

        COUNT(DISTINCT CASE
          WHEN
            (gp.team = 1 AND g.team1_party_wins < g.team2_party_wins)
            OR
            (gp.team = 2 AND g.team2_party_wins < g.team1_party_wins)
          THEN gp.game_id
        END) AS games_lost,

        COUNT(DISTINCT p.id) AS parties_played,

        COUNT(DISTINCT CASE
          WHEN p.winning_team = gp.team
          THEN p.id
        END) AS parties_won,

        COUNT(DISTINCT r.id) AS rounds_played,

        COALESCE(
          SUM(
            CASE
              WHEN gp.team = 1 THEN r.team1_total
              ELSE r.team2_total
            END
          ),
          0
        ) AS total_points,

        COUNT(DISTINCT CASE
          WHEN r.caller_user_id = u.id
          THEN r.id
        END) AS calls,

        COUNT(DISTINCT CASE
          WHEN r.caller_user_id = u.id
               AND r.failed = false
          THEN r.id
        END) AS successful_calls,

        COUNT(DISTINCT CASE
          WHEN r.caller_user_id = u.id
               AND r.failed = true
          THEN r.id
        END) AS failed_calls,

        COUNT(DISTINCT rb.id) AS bids,

        COALESCE(
          SUM(rb.points),
          0
        ) AS bid_points,

        COUNT(DISTINCT CASE
          WHEN r.stiglja = true
               AND r.stiglja_team = gp.team
          THEN r.id
        END) AS stiglje

      FROM users u

      LEFT JOIN game_players gp
        ON gp.user_id = u.id

      LEFT JOIN games g
        ON g.id = gp.game_id

      LEFT JOIN parties p
        ON p.game_id = g.id

      LEFT JOIN rounds r
        ON r.party_id = p.id

      LEFT JOIN round_bids rb
        ON rb.round_id = r.id
        AND rb.user_id = u.id

      GROUP BY
        u.id,
        u.username

      ORDER BY
        games_won DESC,
        total_points DESC
    `);

    const statistics = result.rows.map(player => {

      const gamesPlayed = Number(player.games_played);
      const gamesWon = Number(player.games_won);

      return {
        id: player.id,
        username: player.username,

        gamesPlayed,
        gamesWon,
        gamesLost: Number(player.games_lost),

        winRate:
          gamesPlayed > 0
            ? Number(((gamesWon / gamesPlayed) * 100).toFixed(1))
            : 0,

        partiesPlayed: Number(player.parties_played),
        partiesWon: Number(player.parties_won),

        roundsPlayed: Number(player.rounds_played),

        totalPoints: Number(player.total_points),

        calls: Number(player.calls),
        successfulCalls: Number(player.successful_calls),
        failedCalls: Number(player.failed_calls),

        bids: Number(player.bids),
        bidPoints: Number(player.bid_points),

        stiglje: Number(player.stiglje)
      };

    });

    res.json(statistics);

  } catch (error) {

    console.error(
      'Greška kod dohvaćanja statistike:',
      error
    );

    res.status(500).json({
      message: 'Greška kod dohvaćanja statistike.'
    });

  }
};


module.exports = {
  getStatistics
};