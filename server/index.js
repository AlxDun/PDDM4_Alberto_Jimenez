import express from "express"
import { pool } from "./db_conection.js"

const app = express()
app.use(express.json())
app.get('/', async (request, response) => {
    console.log('Correct connection.')
    response.send('Hello.')
})

app.get('/transactions', async (request, response) => {
    try {
        const query = 'SELECT transactions.transaction_id as transaction, clients.name as client, billing.billing_id, transactions.transaction_state as state FROM transactions JOIN clients ON clients.client_id = transactions.client_id JOIN billing ON billing.billing_id = transactions.billing_id;'
        const [rows] = await pool.query(query)
        response.json(rows)
    } catch (error) {
        response.status(500).json({
            status: 'error',
            endpoint: request.originalUrl,
            method: request.method,
            message: error.message
        })
    }
})

app.get('/transactions/:transaction_id', async (request, response) => {
    try {
        const { transaction_id } = request.params
        const query = 'SELECT transactions.transaction_id as transaction, clients.name as client, billing.billing_id, transactions.transaction_state FROM transactions JOIN clients ON clients.client_id = transactions.client_id JOIN billing ON billing.billing_id = transactions.billing_id WHERE transaction_id = ?;'
        const [rows] = await pool.query(query, transaction_id)
        response.json(rows[0])
    } catch (error) {
        response.status(500).json({
            status: 'error',
            endpoint: request.originalUrl,
            method: request.method,
            message: error.message
        })
    }
})

app.post('/transactions', async (request, response) => {
    try {
        const {
            transaction_id,
            transaction_date,
            transaction_amount,
            transaction_state,
            transaction_type,
            client_id,
            billing_id
        } = request.body

        const query = 'INSERT INTO transactions (transaction_id, transaction_date, transaction_amount, transaction_state, transaction_type, client_id, billing_id) VALUES (?, ?, ?, ?, ?, ?, ?);'

        const values = [
            transaction_id,
            transaction_date,
            transaction_amount,
            transaction_state,
            transaction_type,
            client_id,
            billing_id
        ]

        const [result] = await pool.query(query, values)

        response.status(201).json({
            message: "Transaction created successfully."
        })

    } catch (error) {
        response.status(500).json({
            status: 'error',
            endpoint: request.originalUrl,
            method: request.method,
            message: error.message
        })
    }
})

app.put('/transactions/:transaction_id', async (request, response) => {
    try {
        const { transaction_id } = request.params

        const {
            transaction_date,
            transaction_amount,
            transaction_state,
            transaction_type,
            client_id,
            billing_id
        } = request.body

        const query = 'UPDATE transactions SET transaction_date = ?, transaction_amount = ?, transaction_state = ?, transaction_type = ?, client_id = ?, billing_id = ? WHERE transaction_id = ?;'

        const values = [
            transaction_date,
            transaction_amount,
            transaction_state,
            transaction_type,
            client_id,
            billing_id,
            transaction_id
        ]

        const [result] = await pool.query(query, values)

        if (result.affectedRows != 0) {
            return response.json({ message: "Transaction updated." })
        }

    } catch (error) {
        response.status(500).json({
            status: 'error',
            endpoint: request.originalUrl,
            method: request.method,
            message: error.message
        })
    }
})

app.delete('/transactions/:transaction_id', async (request, response) => {
    try {
        const { transaction_id } = request.params

        const query = 'DELETE FROM transactions WHERE transaction_id = ?;'

        const values = [transaction_id]

        const [result] = await pool.query(query, values)

        if (result.affectedRows != 0) {
            return response.json({ message: "transaction deleted" })
        }

    } catch (error) {
        response.status(500).json({
            status: 'error',
            endpoint: request.originalUrl,
            method: request.method,
            message: error.message
        })
    }
})


// 2. Pending transactions
app.get('/transactions/pending', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT c.name AS Client name, t.transaction_id AS Transaction ID, t.transaction_state AS Transaction state FROM transactions t LEFT JOIN clients c ON t.client_id = c.client_id WHERE t.transaction_state = 'Pendiente';");

        res.json(rows);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            endpoint: req.originalUrl,
            method: req.method,
            message: error.message
        });
    }
});

app.listen(3000, () => {
    console.log('http://localhost:3000')
})