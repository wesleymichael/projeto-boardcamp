import { db } from "../database/database.connection.js";

export async function getCustomers(req, res){
    try{
        const customers = await db.query(`
            SELECT id, name, phone, cpf, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday
                FROM customers;
        `);
        res.send(customers.rows)
    } catch (error){
        res.status(500).send(error.message);
    }
}

export async function getCustomersById(req, res){
    const id = parseInt(req.params.id);

    if(isNaN(id)) return res.sendStatus(400);
    
    try{
        const customer = await db.query(`
            SELECT id, name, phone, cpf, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday
                FROM customers WHERE id=$1;
        `, [id]);

        if(customer.rowCount === 0) return res.sendStatus(404);

        res.send(customer.rows[0]);
    } catch (error){
        res.status(500).send(error.message);
    }
}

export async function insertCustomer(req, res){
    const {name, phone, cpf, birthday} = req.body;

    try{
        const { rowCount } = await db.query(`SELECT 1 FROM customers WHERE cpf = $1;`, [cpf]);
        if( rowCount !== 0 ) return res.sendStatus(409);

        await db.query(`
            INSERT INTO customers ("name", "phone", "cpf", "birthday") VALUES
                ($1, $2, $3, $4);
        `, [name, phone, cpf, birthday]);
        res.sendStatus(201);
    } catch (error){
        res.status(500).send(error.message);
    }
}

export async function updateCustomer(req, res){
    const {name, phone, cpf, birthday} = req.body;
    const id = parseInt(req.params.id);

    if(isNaN(id)) return res.sendStatus(400);

    try{
        const customer = await db.query(`SELECT * FROM customers WHERE id = $1;`, [id]);
        if (customer.rows[0].cpf !== cpf) return res.status(409).send("CPF does not belong to the user");

        await db.query(`
            UPDATE customers 
                SET "name"=$1, "phone"=$2, "cpf"=$3, "birthday"=$4
                WHERE id = $5;`,
        [name, phone, cpf, birthday, id]);  
        res.sendStatus(200);     
    } catch (error){
        res.status(500).send(error.message);
    }
}
