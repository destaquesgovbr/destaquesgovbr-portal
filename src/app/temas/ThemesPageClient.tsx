'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import THEME_ICONS from '@/lib/themes'

export default function ThemesPageClient() {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {Object.keys(THEME_ICONS).map((theme) => (
        <Link key={theme} href={`/temas/${theme}`}>
          <Card className="group h-full transition-all duration-300 hover:scale-[1.01] shadow-sm hover:shadow-xl hover:shadow-[#0D4C92]/20">
            <div className="h-[60%] overflow-hidden flex items-center justify-center">
              <img
                src={THEME_ICONS[theme].image}
                alt={theme}
                className="object-contain h-full transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <CardHeader className="pt-4 px-5">
              <h3 className="font-semibold leading-tight text-lg">{theme}</h3>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-sm line-clamp-3">
                <MarkdownRenderer content={THEME_ICONS[theme].description} />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </motion.div>
  )
}
