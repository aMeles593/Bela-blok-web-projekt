const pool = require('../db');

const saveGame = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      targetScore,
      players,
      parties
    } = req.body;

    if (!targetScore || !players || players.length !== 4 || !parties) {
      return res.status(400).json({
        message: 'Neispravni podaci igre.'
      });
    }

    await client.query('BEGIN');

    // 1. Spremi igru
    const gameResult = await client.query(
      `
      INSERT INTO games (
        target_score,
        team1_party_wins,
        team2_party_wins,
        finished_at
      )
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING id
      `,
      [
        targetScore,
        parties.filter(p => p.winningTeam === 1).length,
        parties.filter(p => p.winningTeam === 2).length
      ]
    );

    const gameId = gameResult.rows[0].id;

    // 2. Spremi igrače
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

    // 3. Spremi partije
    for (const party of parties) {

      const partyResult = await client.query(
        `
        INSERT INTO parties (
          game_id,
          party_number,
          team1_score,
          team2_score,
          winning_team,
          started_at,
          finished_at
        )
        VALUES (
          $1, $2, $3, $4, $5,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        RETURNING id
        `,
        [
          gameId,
          party.partyNumber,
          party.team1Score,
          party.team2Score,
          party.winningTeam
        ]
      );

      const partyId = partyResult.rows[0].id;

      // 4. Spremi runde
      for (const round of party.rounds) {

        const roundResult = await client.query(
          `
          INSERT INTO rounds (
            party_id,
            round_number,
            caller_user_id,
            trump,
            team1_points,
            team2_points,
            team1_bids,
            team2_bids,
            team1_total,
            team2_total,
            failed,
            stiglja,
            stiglja_team
          )
          VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11, $12, $13
          )
          RETURNING id
          `,
          [
            partyId,
            round.number,
            round.callerId,
            round.trump,
            round.team1Points,
            round.team2Points,
            round.team1Bids,
            round.team2Bids,
            round.team1Total,
            round.team2Total,
            round.failed,
            round.stiglja,
            round.stigljaTeam
          ]
        );

        const roundId = roundResult.rows[0].id;

        // 5. Spremi zvanja
        if (round.bids && round.bids.length > 0) {

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

    console.error('Greška kod spremanja igre:', error);

    res.status(500).json({
      message: 'Greška kod spremanja igre.'
    });

  } finally {
    client.release();
  }
};

module.exports = {
  saveGame
};