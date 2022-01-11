import { Client } from 'faunadb'

export const faunaDb = new Client({
	secret: process.env.FAUNADB_KEY,
})
