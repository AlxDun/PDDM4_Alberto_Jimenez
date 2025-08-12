import fs from 'fs'
import path, { resolve } from 'path'
import csv from 'csv-parser'
import { pool } from '../db_conection.js'

export async function loadClients() {
    const fileRoute = path.resolve('server/data/clients.csv')
    const clients = []

    return new Promise((resolve, reject) => {
        fs.createReadStream(fileRoute)
            .pipe(csv())
            .on('data', (row) => {
                clients.push([
                    row.client_id,
                    row.name.trim(),
                    row.identification,
                    row.adress,
                    row.phone,
                    row.email
                ])
            })
            .on('end', async () => {
                try {
                    const sql = 'INSERT INTO clients (client_id,name,identification,adress,phone,email) VALUES ?';
                    const [result] = await pool.query(sql, [clients])

                    console.log(`Se añadieron ${result.affectedRows} entidades a la tabla clients.`)
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