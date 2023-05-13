import { db } from "../database/database.connection.js";

export async function rentalsValidation(req, res, next){
    const { customerId, gameId, daysRented} = req.body;

    if( isNaN(daysRented) || daysRented <= 0) return res.status(400).send("Invalid number of rented days");

    try{
        const customer = await db.query(`SELECT 1 FROM customers WHERE id = $1;`, [customerId]);
        if(customer.rowCount === 0) return res.status(400).send("Invalid customer ID");

        const game = await db.query(`
            SELECT games.id, games."stockTotal", games."pricePerDay"
                FROM games WHERE id = $1;
        `,[gameId]);
        if(game.rowCount === 0) return res.status(400).send("Invalid game ID");

        const rentedGames = await db.query(`
            SELECT COUNT(*) FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL;    
        `,[gameId]);
        if(game.rows[0].stockTotal <= rentedGames.rows[0].count) return res.status(400).send("Out of stock");       
        
        res.locals.game = game.rows[0];
        next();

    } catch (error) {
        res.status(500).send(error.message);
    }   
}
