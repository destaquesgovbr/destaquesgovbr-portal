import { Building2, Heart, TrendingUp, Users } from "lucide-react"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import NewsCard from "@/components/NewsCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const featuredNews = {
  title:
    "Governo Federal anuncia novo pacote de investimentos em infraestrutura",
  summary:
    "Presidente assina decreto que destina R$ 50 bilhões para obras de modernização de rodovias, ferrovias e portos em todo o país, priorizando regiões com maior necessidade de desenvolvimento.",
  category: "Infraestrutura",
  date: "10 de Janeiro, 2024",
  imageUrl: "news-hero.png",
}

const recentNews = [
  {
    title:
      "Ministério da Saúde amplia cobertura de vacinas para população infantil",
    summary:
      "Nova campanha nacional de vacinação será implementada em todos os estados brasileiros.",
    category: "Saúde",
    date: "9 de Janeiro, 2024",
    imageUrl: "news-health.png",
  },
  {
    title: "Programa de educação digital chega a mais 1000 escolas públicas",
    summary:
      "Iniciativa visa modernizar o ensino através da tecnologia em comunidades rurais.",
    category: "Educação",
    date: "8 de Janeiro, 2024",
    imageUrl: "news-education.png",
  },
  {
    title: "Aprovação de nova lei de incentivo à inovação tecnológica",
    summary:
      "Medida prevê benefícios fiscais para startups e empresas de tecnologia nacional.",
    category: "Economia",
    date: "7 de Janeiro, 2024",
  },
  {
    title: "Expansão do programa habitacional para famílias de baixa renda",
    summary:
      "Governo anuncia construção de 100 mil novas unidades habitacionais em 2024.",
    category: "Habitação",
    date: "6 de Janeiro, 2024",
    imageUrl: "news-infrastructure.jpg",
  },
]

const categories = [
  { name: "Economia", icon: TrendingUp, count: 45 },
  { name: "Saúde", icon: Heart, count: 32 },
  { name: "Educação", icon: Users, count: 28 },
  { name: "Infraestrutura", icon: Building2, count: 23 },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-subtle py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured news */}
              <div className="lg:col-span-2">
                <NewsCard {...featuredNews} isMain={true} />
              </div>

              {/* Categories sidebar */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Categorias</h2>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category.name}
                        className="flex items-center justify-between p-3 bg-card rounded-lg hover:shadow-card transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <category.icon className="w-5 h-5 text-primary" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <Badge variant="secondary">{category.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-government rounded-lg text-white">
                  <h3 className="font-semibold mb-2">Transparência Pública</h3>
                  <p className="text-sm mb-4 text-white/90">
                    Acesse dados e informações sobre gastos públicos e ações
                    governamentais.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white text-foreground hover:bg-white/90"
                  >
                    Acessar Portal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent News */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Últimas Notícias</h2>
              <Button variant="outline">Ver Todas</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentNews.map((news, index) => (
                <NewsCard key={index} {...news} />
              ))}
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-government-gray">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">156</div>
                <div className="text-sm text-muted-foreground">
                  Notícias publicadas este mês
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">27</div>
                <div className="text-sm text-muted-foreground">
                  Ministérios ativos
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <div className="text-sm text-muted-foreground">
                  Taxa de transparência
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24h</div>
                <div className="text-sm text-muted-foreground">
                  Atualização contínua
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
