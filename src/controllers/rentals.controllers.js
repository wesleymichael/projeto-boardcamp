import { db } from "../database/database.connection.js";

export async function getRentals(req, res){
    try{
        const rentals = await db.query(`
            SELECT rentals.*, TO_CHAR(rentals."rentDate", 'YYYY-MM-DD') AS "rentDate", 
                json_build_object('id', customers.id, 'name', customers.name) AS "customer",
                json_build_object('id', games.id, 'name', games.name) AS "game"
                FROM rentals 
                JOIN customers ON rentals."customerId" = customers.id
                JOIN games ON rentals."gameId" = games.id;
        `);
        res.send(rentals.rows);
    } catch (error){
        res.status(500).send(error.message);
    }
}

export async function insertRental(req, res){
    const { customerId, gameId, daysRented } = req.body;

    try{
        const game = res.locals.game;
        const originalPrice = daysRented*game.pricePerDay;

        await db.query(`
            INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
                VALUES ($1, $2, NOW(), $3, null, $4, null);
        `, [customerId, gameId, daysRented, originalPrice]);
        res.sendStatus(201);
    } catch (error) {
        res.status(500).send(error.message);
    }
}
