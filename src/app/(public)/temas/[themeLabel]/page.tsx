import { getAgenciesList } from '@/data/agencies-utils'
import ThemePageClient from './ThemePageClient'

type ThemePageProps = {
  params: Promise<{
    themeLabel: string
  }>
}

export default async function ThemePage({ params }: ThemePageProps) {
  const { themeLabel } = await params
  const decodedThemeLabel = decodeURIComponent(themeLabel)
  const agencies = await getAgenciesList()

  return <ThemePageClient themeLabel={decodedThemeLabel} agencies={agencies} />
}
