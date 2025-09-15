import { Calendar, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface NewsCardProps {
  title: string
  summary: string
  category: string
  date: string
  imageUrl?: string
  isMain?: boolean
}

const NewsCard = ({
  title,
  summary,
  category,
  date,
  imageUrl,
  isMain = false,
}: NewsCardProps) => {
  return (
    <Card
      className={`hover:shadow-government transition-all duration-300 cursor-pointer group ${isMain ? "col-span-2 row-span-2" : ""}`}
    >
      {imageUrl && (
        <div className={`relative overflow-hidden ${isMain ? "h-64" : "h-40"}`}>
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white/90 text-foreground">
              <Tag className="w-3 h-3 mr-1" />
              {category}
            </Badge>
          </div>
        </div>
      )}
      <CardHeader className={isMain ? "p-6" : "p-4"}>
        {!imageUrl && (
          <Badge variant="secondary" className="w-fit">
            <Tag className="w-3 h-3 mr-1" />
            {category}
          </Badge>
        )}
        <h3
          className={`font-semibold leading-tight group-hover:text-primary transition-colors ${isMain ? "text-xl" : "text-base"}`}
        >
          {title}
        </h3>
      </CardHeader>
      <CardContent className={isMain ? "px-6 pb-6" : "px-4 pb-4"}>
        <p
          className={`text-muted-foreground mb-4 ${isMain ? "text-base" : "text-sm"}`}
        >
          {summary}
        </p>
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="w-3 h-3 mr-1" />
          {date}
        </div>
      </CardContent>
    </Card>
  )
}

export default NewsCard
