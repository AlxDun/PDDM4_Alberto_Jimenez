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
        const query = 'SELECT * FROM transactions;' /*'SELECT transactions.transaction_id as transaction, clients.name as client, billing.billing_id, transactions.transaction_state FROM transactions JOIN clients ON clients.client_id = transactions.client_id JOIN billing ON billing.billing_id = transactions.billing_id WHERE transaction_id = ?;'*/
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
            isbn,
            id_usuario,
            fecha_prestamo,
            fecha_devolucion,
            estado
        } = request.body

        const query = 'INSERT INTO transactions (isbn, id_usuario, fecha_prestamo, fecha_devolucion, estado) VALUES (?, ?, ?, ?, ?);'

        const values = [
            isbn,
            id_usuario,
            fecha_prestamo,
            fecha_devolucion,
            estado
        ]

        const [result] = await pool.query(query, values)

        response.status(201).json({
            message: "prestamo creado exitosamente"
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
            isbn,
            id_usuario,
            fecha_prestamo,
            fecha_devolucion,
            estado
        } = request.body

        const query = 'UPDATE transactions SET isbn = ?, id_usuario = ?, fecha_prestamo = ?, fecha_devolucion = ? , estado = ? WHERE transaction_id = ?;'

        const values = [
            isbn,
            id_usuario,
            fecha_prestamo,
            fecha_devolucion,
            estado,
            transaction_id
        ]

        const [result] = await pool.query(query, values)

        if (result.affectedRows != 0) {
            return response.json({ message: "prestamo actualizado" })
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
            return response.json({ message: "prestamo eliminado" })
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

// 1. Ver todos los préstamos de un usuario
app.get('/transactions/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
            SELECT 
                p.transaction_id,
                p.fecha_prestamo,
                p.fecha_devolucion,
                p.estado,
                l.isbn,
                l.titulo AS libro
            FROM transactions p
            LEFT JOIN libros l ON p.isbn = l.isbn
            WHERE p.id_usuario = ?
        `, [id]);

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

// 2. Listar los 5 libros más prestados
app.get('/libros/mas-prestados', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                l.isbn,
                l.titulo,
                COUNT(p.transaction_id) AS total_prestamos
            FROM transactions p
            LEFT JOIN libros l ON p.isbn = l.isbn
            GROUP BY l.isbn, l.titulo
            ORDER BY total_prestamos DESC
            LIMIT 5
        `);

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

// 3. Listar clients con préstamos en estado "retrasado"
app.get('/clients/con-retrasos', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DISTINCT
                u.id_usuario,
                u.name
            FROM transactions p
            LEFT JOIN clients u ON p.id_usuario = u.id_usuario
            WHERE p.estado = 'retrasado'
        `);

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

// 4. Listar préstamos activos
app.get('/transactions/activos', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.transaction_id, p.fecha_prestamo, p.fecha_devolucion, p.estado, u.name AS usuario, l.titulo AS libro FROM transactions p LEFT JOIN clients u ON p.id_usuario = u.id_usuario LEFT JOIN libros l ON p.isbn = l.isbn WHERE p.estado = 'activo'
        `);

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

// 5. Historial de un libro por su ISBN
app.get('/transactions/historial/:isbn', async (req, res) => {
    try {
        const { isbn } = req.params;
        const [rows] = await pool.query(`
            SELECT 
                p.transaction_id,
                p.fecha_prestamo,
                p.fecha_devolucion,
                p.estado,
                u.name AS usuario
            FROM transactions p
            LEFT JOIN clients u ON p.id_usuario = u.id_usuario
            WHERE p.isbn = ?
            ORDER BY p.fecha_prestamo DESC
        `, [isbn]);

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