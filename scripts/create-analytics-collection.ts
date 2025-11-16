/**
 * Script para criar a collection de analytics no Typesense
 *
 * Uso: npx tsx scripts/create-analytics-collection.ts
 */

import { typesense } from '../src/lib/typesense-client'
import { ANALYTICS_COLLECTION_NAME, ANALYTICS_SCHEMA } from '../src/lib/analytics-schema'

async function main() {
  try {
    console.log('🔍 Verificando se collection já existe...')

    // Tentar buscar a collection
    try {
      await typesense.collections(ANALYTICS_COLLECTION_NAME).retrieve()
      console.log('✅ Collection já existe!')
      return
    } catch (error: any) {
      if (error?.httpStatus === 404) {
        console.log('📝 Collection não existe, criando...')
      } else {
        throw error
      }
    }

    // Criar collection
    await typesense.collections().create(ANALYTICS_SCHEMA)
    console.log('✅ Collection criada com sucesso!')

    // Verificar criação
    const collection = await typesense.collections(ANALYTICS_COLLECTION_NAME).retrieve()
    console.log('📊 Collection info:', {
      name: collection.name,
      num_documents: collection.num_documents,
      fields: collection.fields.length
    })

  } catch (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  }
}

main()
