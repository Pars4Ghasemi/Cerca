import { MongoClient } from 'mongodb'

const uri = process.env.MONGO_URL
const dbName = process.env.DB_NAME || 'cerca_demo'

let cached = global.__cercaMongo
if (!cached) cached = global.__cercaMongo = { client: null, promise: null }

export async function getDb() {
  if (cached.client) return cached.client.db(dbName)
  if (!cached.promise) {
    cached.promise = new MongoClient(uri, { maxPoolSize: 10 }).connect()
  }
  cached.client = await cached.promise
  return cached.client.db(dbName)
}
