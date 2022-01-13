import { Client } from 'faunadb'

export const faunaDB = new Client({
	secret: process.env.FAUNADB_KEY,
})
