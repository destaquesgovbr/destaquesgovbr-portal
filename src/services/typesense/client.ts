import Typesense from 'typesense'

const host = process.env.TYPESENSE_HOST || 'localhost'
const port = Number(process.env.TYPESENSE_PORT) || 8108
const protocol = (process.env.TYPESENSE_PROTOCOL || 'http') as 'http' | 'https'
const apiKey =
  process.env.TYPESENSE_API_KEY || 'govbrnews_api_key_change_in_production'

export const typesense = new Typesense.Client({
  nodes: [{ host, port, protocol }],
  apiKey,
  connectionTimeoutSeconds: 10,
})
