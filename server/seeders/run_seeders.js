import { loadClients } from "./load_clients.js"
import { loadBilling } from "./load_billing.js"
import { loadTransactions } from "./load_transactions.js"

(async () => {
    try {
        console.log('Hi.')
        await loadClients()
        await loadBilling()
        await loadTransactions()
        console.log('Bye.')
    } catch (error) {
        console.error('Error: ', error.message)
    } finally {
        process.exit()
    }
})()