import fs from 'fs'
import path, { resolve } from 'path'
import csv from 'csv-parser'
import { pool } from '../db_conection.js'

export async function loadTransactions() {
    const fileRoute = path.resolve('server/data/transactions.csv')
    const transactions = []

    return new Promise((resolve, reject) => {
        fs.createReadStream(fileRoute)
            .pipe(csv())
            .on('data', (row) => {
                transactions.push([
                    row.transaction_id,
                    row.transaction_date,
                    row.transaction_amount,
                    row.transaction_state,
                    row.transaction_type,
                    row.client_id,
                    row.billing_id
                ])
            })
            .on('end', async () => {
                try {
                    const sql = 'INSERT INTO transactions (transaction_id,transaction_date,transaction_amount,transaction_state,transaction_type,client_id,billing_id) VALUES ?';
                    const [result] = await pool.query(sql, [transactions])

                    console.log(`Se añadieron ${result.affectedRows} entidades a la tabla transactions.`)
                    resolve()
                } catch (error) {
                    console.error('Error: ', error.message)
                    reject(error)

                }
            })
            .on('error', (error) => {
                console.error('Error: ', error.message)
                reject(error)
            })
    })
}