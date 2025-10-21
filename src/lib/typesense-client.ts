import Typesense from 'typesense'

const host = process.env.NEXT_PUBLIC_TYPESENSE_HOST ?? 'localhost'
const port = 8108
const protocol = 'http'

export const typesense= new Typesense.Client({
  nodes: [{ host, port, protocol }],
  apiKey: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY ?? 'govbrnews_api_key_change_in_production',
  connectionTimeoutSeconds: 10
})
