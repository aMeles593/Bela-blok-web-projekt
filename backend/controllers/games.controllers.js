const pool = require('../db');

const saveGame = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      targetScore,
      players,
      parties
    } = req.body;

    // -------------------------------------------------
    // VALIDACIJA
    // -------------------------------------------------

    if (
      !targetScore ||
      !players ||
      ![2, 3, 4].includes(players.length) ||
      !Array.isArray(parties)
    ) {
      return res.status(400).json({
        message: 'Neispravni podaci igre.'
      });
    }

    const playerCount = players.length;

    // -------------------------------------------------
    // PROVJERA BROJA IGRAČA I EKIPA
    // -------------------------------------------------

    if (playerCount === 2) {

      for (const player of players) {
        if (![1, 2].includes(player.team)) {
          return res.status(400).json({
            message: 'Neispravne ekipe za igru s 2 igrača.'
          });
        }
      }

    } else if (playerCount === 3) {

      for (const player of players) {
        if (![1, 2, 3].includes(player.team)) {
          return res.status(400).json({
            message: 'Neispravne ekipe za igru s 3 igrača.'
          });
        }
      }

    } else {

      for (const player of players) {
        if (![1, 2].includes(player.team)) {
          return res.status(400).json({
            message: 'Neispravne ekipe za igru s 4 igrača.'
          });
        }
      }

    }

    await client.query('BEGIN');

    // -------------------------------------------------
    // 1. SPREMI IGRU
    // -------------------------------------------------

    const team1Wins = parties.filter(
      p => p.winningTeam === 1
    ).length;

    const team2Wins = parties.filter(
      p => p.winningTeam === 2
    ).length;

    const team3Wins = parties.filter(
      p => p.winningTeam === 3
    ).length;

    const gameResult = await client.query(
      `
      INSERT INTO games (
        target_score,
        player_count,
        team1_party_wins,
        team2_party_wins,
        team3_party_wins,
        finished_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        CURRENT_TIMESTAMP
      )
      RETURNING id
      `,
      [
        targetScore,
        playerCount,
        team1Wins,
        team2Wins,
        team3Wins
      ]
    );

    const gameId = gameResult.rows[0].id;

    // -------------------------------------------------
    // 2. SPREMI IGRAČE
    // -------------------------------------------------

    for (const player of players) {

      await client.query(
        `
        INSERT INTO game_players (
          game_id,
          user_id,
          team
        )
        VALUES ($1, $2, $3)
        `,
        [
          gameId,
          player.id,
          player.team
        ]
      );

    }

    // -------------------------------------------------
    // 3. SPREMI PARTIJE
    // -------------------------------------------------

    for (const party of parties) {

      const partyResult = await client.query(
        `
        INSERT INTO parties (
          game_id,
          party_number,
          team1_score,
          team2_score,
          team3_score,
          winning_team,
          started_at,
          finished_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        RETURNING id
        `,
        [
          gameId,
          party.partyNumber,
          party.team1Score ?? 0,
          party.team2Score ?? 0,
          party.team3Score ?? 0,
          party.winningTeam
        ]
      );

      const partyId = partyResult.rows[0].id;

      // -------------------------------------------------
      // 4. SPREMI RUNDE
      // -------------------------------------------------

      for (const round of party.rounds || []) {

        const roundResult = await client.query(
          `
          INSERT INTO rounds (
            party_id,
            round_number,
            caller_user_id,
            trump,

            team1_points,
            team2_points,
            team3_points,

            team1_bids,
            team2_bids,
            team3_bids,

            team1_total,
            team2_total,
            team3_total,

            failed,
            stiglja,
            stiglja_team
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,

            $5,
            $6,
            $7,

            $8,
            $9,
            $10,

            $11,
            $12,
            $13,

            $14,
            $15,
            $16
          )
          RETURNING id
          `,
          [
            partyId,
            round.number,
            round.callerId ?? null,
            round.trump,

            round.team1Points ?? 0,
            round.team2Points ?? 0,
            round.team3Points ?? 0,

            round.team1Bids ?? 0,
            round.team2Bids ?? 0,
            round.team3Bids ?? 0,

            round.team1Total ?? 0,
            round.team2Total ?? 0,
            round.team3Total ?? 0,

            round.failed ?? false,
            round.stiglja ?? false,
            round.stigljaTeam ?? null
          ]
        );

        const roundId = roundResult.rows[0].id;

        // -------------------------------------------------
        // 5. SPREMI ZVANJA
        // -------------------------------------------------

        if (
          Array.isArray(round.bids) &&
          round.bids.length > 0
        ) {

          for (const bid of round.bids) {

            await client.query(
              `
              INSERT INTO round_bids (
                round_id,
                user_id,
                points
              )
              VALUES ($1, $2, $3)
              `,
              [
                roundId,
                bid.playerId,
                bid.points
              ]
            );

          }

        }

      }

    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Igra je uspješno spremljena.',
      gameId
    });

  } catch (error) {

    await client.query('ROLLBACK');

    console.error(
      'Greška kod spremanja igre:',
      error
    );

    res.status(500).json({
      message: 'Greška kod spremanja igre.'
    });

  } finally {

    client.release();

  }
};


// =====================================================
// DOHVAT SVIH IGARA
// =====================================================

const getGames = async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT
        g.id,
        g.target_score,
        g.player_count,
        g.started_at,
        g.finished_at,

        g.team1_party_wins,
        g.team2_party_wins,
        g.team3_party_wins,

        COUNT(DISTINCT p.id) AS party_count,

        STRING_AGG(
          u.username,
          ', ' ORDER BY gp.team, gp.id
        ) AS players

      FROM games g

      LEFT JOIN game_players gp
        ON gp.game_id = g.id

      LEFT JOIN users u
        ON u.id = gp.user_id

      LEFT JOIN parties p
        ON p.game_id = g.id

      GROUP BY
        g.id,
        g.target_score,
        g.player_count,
        g.started_at,
        g.finished_at,
        g.team1_party_wins,
        g.team2_party_wins,
        g.team3_party_wins

      ORDER BY g.id DESC
    `);

    res.json(result.rows);

  } catch (error) {

    console.error(
      'Greška kod dohvaćanja igara:',
      error
    );

    res.status(500).json({
      message: 'Greška kod dohvaćanja igara.'
    });

  }

};


module.exports = {
  saveGame,
  getGames
};