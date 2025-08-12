import fs from 'fs'
import path, { resolve } from 'path'
import csv from 'csv-parser'
import { pool } from '../db_conection.js'

export async function loadBilling() {
    const fileRoute = path.resolve('server/data/billing.csv')
    const billing = []

    return new Promise((resolve, reject) => {
        fs.createReadStream(fileRoute)
            .pipe(csv())
            .on('data', (row) => {
                billing.push([
                    row.billing_id,
                    row.platform,
                    row.period,
                    row.amount_billed,
                    row.amount_paid
                ])
            })
            .on('end', async () => {
                try {
                    const sql = 'INSERT INTO billing (billing_id,platform,period,amount_billed,amount_paid) VALUES ?';
                    const [result] = await pool.query(sql, [billing])

                    console.log(`Se añadieron ${result.affectedRows} entidades a la tabla billing.`)
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