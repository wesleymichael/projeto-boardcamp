import { db } from "../database/database.connection.js";
import moment from "moment";

function dateDiff(date){
    const dateNow = new Date().toISOString().slice(0, 10);

    const date1 = moment(date);
    const date2 = moment(dateNow);
    const diffInDays = date2.diff(date1, 'days');

    return diffInDays;
}

export async function getRentals(req, res){
    try{
        const rentals = await db.query(`
            SELECT rentals.*, TO_CHAR(rentals."rentDate", 'YYYY-MM-DD') AS "rentDate", 
                TO_CHAR(rentals."returnDate", 'YYYY-MM-DD') AS "returnDate",
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

export async function finalizeRental(req, res){
    const id = parseInt(req.params.id);

    if(isNaN(id)) return res.sendStatus(400);

    try{
        const { rows } = await db.query(`
            SELECT TO_CHAR(rentals."rentDate", 'YYYY-MM-DD') AS "rentDate", "daysRented", "returnDate",
                json_build_object('id', games.id, 'pricePerDay', games."pricePerDay") AS "game"
                FROM rentals
                JOIN games ON rentals."gameId" = games.id
                WHERE rentals.id = $1;
        `,  [id]);
        const rental = rows[0];

        if (rows.length === 0) return res.sendStatus(404);
        if (rental.returnDate) return res.sendStatus(400);

        const delayInDays = Math.max( dateDiff(rental.rentDate) - rental.daysRented, 0);
        const delayFee = delayInDays * rental.game.pricePerDay;

        await db.query(`
            UPDATE rentals 
            SET "returnDate" = NOW(), "delayFee" = $1
            WHERE rentals.id = $2;
        `, [delayFee, id]);

        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function deleteRental(req, res){
    const id = parseInt(req.params.id);

    if(isNaN(id)) return res.sendStatus(400);

    try{
        const rental = await db.query(`SELECT rentals."returnDate" FROM rentals WHERE id = $1`, [id]);

        if( rental.rowCount === 0 ) return res.sendStatus(404);
        if( rental.rows[0].returnDate === null ) return res.sendStatus(400);

        await db.query(`
            DELETE FROM rentals
                WHERE id = $1 AND "delayFee" IS NOT NULL;
        `, [id]);

        res.sendStatus(200);
    } catch (error){
        res.status(500).send(error.message);
    }
}
