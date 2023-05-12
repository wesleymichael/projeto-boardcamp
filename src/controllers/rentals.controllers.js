import { db } from "../database/database.connection.js";

export async function getRentals(req, res){
    try{
        const rentals = await db.query(`
            SELECT rentals.*, 
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
