const THEME_ICONS: Record<string, { image: string, description: string}> = {
  "Economia e Finanças": {
    image: "/01 - Economia e Finanças.png",
    description: "Inspirado na moeda de um real, o ícone representa a solidez e a identidade econômica do Brasil em uma leitura moderna e institucional."
  },
  "Educação": {
    image: "/02 - Educação.png",
    description: "Inspirado nos círculos de cultura de Paulo Freire, o ícone representa o conhecimento compartilhado. O livro central simboliza a aprendizagem como ato coletivo, conectado por redes de saber que unem diferentes vozes e experiências.  *“Ninguém educa ninguém, ninguém educa a si mesmo, os homens se educam em comunhão, mediatizados pelo mundo.”*  — **Paulo Freire**, *Pedagogia do Oprimido* (1968)"
  },
  "Saúde": {
    image: "/03 - Saúde.png",
    description: "Inspirado no princípio do cuidado mútuo que fundamenta o SUS, o ícone representa o ato coletivo de proteger e acolher. Saúde, aqui, não é apenas atendimento médico — é vínculo, presença e empatia. É sobre *cuidar do outro pra cuidar de todos*."
  },
  "Segurança Pública": {
    image: "/04 - Segurança Pública.png",
    description: "Inspirado no conceito de *Rede de Confiança*, o ícone representa a união entre pessoas que, juntas, formam o círculo de proteção que sustenta o país. As três figuras em verde, amarelo e vermelho se conectam em torno de um centro azul — o bem comum —, simbolizando a harmonia entre comunidade e instituições públicas em torno de um mesmo propósito. A imagem expressa uma visão de segurança construída sobre **confiança, diálogo e solidariedade**, onde cada cidadão é parte ativa no cuidado coletivo. Segurança é, antes de tudo, **um pacto de convivência** — o compromisso de proteger e ser protegido."
  },
  "Meio Ambiente e Sustentabilidade": {
    image: "/05 - Meio Ambiente e Sustentabilidade.png",
    description: "Inspirado no lobo-guará, símbolo brasileiro de equilíbrio e serenidade, o ícone representa a convivência harmoniosa entre o país e sua natureza. O lobo em vermelho ocupa o centro, cercado por folhas tropicais nas cores verde, amarela e azul — expressão da vida que floresce quando há respeito entre sociedade e meio ambiente. "
  },
  "Ciência, Tecnologia e Inovação": {
    image: "/06 - Ciência, Tecnologia e Inovação.png",
    description: "Inspirado na harmonia dos sistemas dinâmicos, o ícone representa o conhecimento como movimento contínuo. O centro azul simboliza o saber público, enquanto as órbitas coloridas em verde, amarelo e vermelho expressam o fluxo de ideias, pessoas e tecnologias que impulsionam o país. "
  },
  "Infraestrutura e Transportes": {
    image: "/07 - Infraestrutura e Transportes.png",
    description: "Inspirado nos mapas de metrô e nas redes que unem o país, o ícone representa a infraestrutura como sistema vivo de conexões. As linhas coloridas convergem para o centro azul, simbolizando o planejamento que integra regiões, pessoas e oportunidades. A imagem expressa o Brasil em movimento — um território interligado por caminhos que constroem desenvolvimento, acesso e pertencimento."
  },
  "Cultura, Artes e Patrimônio": {
    image: "/08 - Cultura, Artes e Patrimônio.png",
    description: "Inspirado na força dos sons e formas brasileiras, o ícone representa a cultura como movimento vivo — o ritmo que nasce de dentro e se espalha em múltiplas vozes. As formas geométricas coloridas evocam instrumentos, danças e expressões que compõem o mosaico cultural do país. "
  },
  "Esportes e Lazer": {
    image: "/09 - Esportes e Lazer.png",
    description: "Inspirado nas rodas de capoeira, o ícone representa o movimento do corpo em harmonia com o outro. As curvas coloridas orbitam em torno de uma corda azul — símbolo de energia, ritmo e tradição brasileira. O esporte e o lazer são expressões de saúde e convivência. São o tempo do corpo, da amizade e do reencontro com a alegria. Aqui, o movimento não é disputa: é bem-estar, celebração e vida em comunidade. "
  },
  "Agricultura, Pecuária e Abastecimento": {
    image: "/10 - Agricultura, Pecuária e Abastecimento.png",
    description: "O ícone celebra as famílias agricultoras — pessoas que vivem da terra e fazem dela o alimento de todos. Representa o trabalho coletivo que nutre o país e mantém viva a relação entre gente, natureza e comunidade."
  },
  "Indústria e Comércio": {
    image: "/11 - Indústria e Comércio.png",
    description: "O ícone representa o Brasil que gira junto — o país que produz, transforma e faz acontecer. A engrenagem colorida simboliza o trabalho coletivo, a tecnologia e o movimento contínuo da economia nacional. É a força de quem cria, fabrica e conecta o Brasil com o mundo."
  },
  "Relações Internacionais e Diplomacia": {
    image: "/12 - Relações Internacionais e Diplomacia.png",
    description: "Inspirado na arquitetura do Palácio do Itamaraty, o ícone representa o Brasil como ponte entre nações. Os arcos e reflexos evocam o diálogo, o equilíbrio e a cooperação que guiam a presença do país no mundo. É a diplomacia como arte de construir pontes — ser firme nas formas e leve nos gestos."
  },
  "Justiça e Direitos Humanos": {
    image: "/13 - Justiça e Direitos Humanos.png",
    description: "O ícone simboliza a união e o respeito que sustentam a dignidade humana. As formas que se tocam em círculo representam mãos que se encontram — diferentes em cor e origem, mas iguais em valor e presença. É a imagem da justiça como pacto coletivo: quando o gesto de um protege o direito de todos."
  },
  "Trabalho e Emprego": {
    image: "/14 - Trabalho e Emprego.png",
    description: "O ícone representa a força coletiva que move o Brasil — o trabalho como elo entre diferentes saberes e profissões. As quatro mãos, nas cores do portal, simbolizam a união dos trabalhadores do campo, da indústria, dos serviços e das artes, cada uma empunhando a sua ferramenta. Sem centro dominante, o círculo expressa o equilíbrio e a dignidade de quem constrói o país com as próprias mãos. O trabalho é mais que sustento: é cooperação, é criação, é o gesto que nos liga como sociedade."
  },
  "Desenvolvimento Social": {
    image: "/15 - Desenvolvimento Social.png",
    description: "O ícone simboliza a construção de um país que cresce junto. As figuras humanas geométricas se erguem em curva ascendente, representando a solidariedade e o progresso que nasce do cuidado com o outro. Desenvolvimento social é mais que política pública — é o compromisso de garantir dignidade, empatia e oportunidades para todos."
  },
  "Turismo": {
    image: "/16 - Turismo.png",
    description: "O turismo é o reencontro do Brasil consigo mesmo — um convite à descoberta de suas próprias paisagens, povos e histórias. Neste ícone modernista, quatro colinas coloridas formam um círculo contínuo, representando a diversidade cultural e geográfica do país: o verde evoca os povos originários e a agricultura familiar, o azul celebra o litoral e as manifestações de fé e alegria popular, o vermelho traz o aconchego e a força das famílias do interior, e o amarelo reflete a ciência, a modernidade e o pensamento brasileiro. Cada cor se une à outra como parte de um mesmo território — um Brasil que se reconhece em suas diferenças e se reencontra no afeto, na cultura e na beleza de viajar por si mesmo."
  },
  "Energia e Recursos Minerais": {
    image: "/17 - Energia e Recursos Minerais.png",
    description: "Inspirado na força da engenharia nacional, o ícone apresenta quatro faixas diagonais que simbolizam as matrizes energéticas do Brasil. Cada uma, com sua cor e ritmo próprio, representa uma conquista técnica e um marco da nossa soberania energética:  - **Amarelo:** a energia solar e a inovação científica que abrem novos horizontes.  - **Verde:** o fluxo do Rio São Francisco, símbolo da integração e da vida que se renova pela água.  - **Azul:** a grandiosidade de Itaipu e o domínio das forças hídricas que unem fronteiras.  - **Vermelho:** a potência do pré-sal e da energia nuclear controlada, expressão do engenho humano. O design em faixas paralelas transmite estabilidade, trabalho contínuo e confiança — uma homenagem à engenharia brasileira que constrói, ilumina e move o país."
  },
  "Comunicações e Mídia": {
    image: "/18 - Comunicações e Mídia.png",
    description: "Inspirado na força da comunicação popular, o ícone representa o povo como centro da fala pública. As ondas coloridas simbolizam as vozes que ecoam de todos os cantos do país — a informação nascendo da base e se espalhando de forma livre e coletiva. É a democratização da palavra e o direito de comunicar."
  },
  "Defesa e Forças Armadas": {
    image: "/19 - Defesa e Forças Armadas.png",
    description: "Este ícone representa o verdadeiro sentido do lema “Um braço forte, uma mão amiga” — as forças que sustentam e amparam o povo brasileiro, guiando-o rumo à sua soberania e futuro. A imagem simboliza proteção, apoio e união nacional, em que a força se coloca a serviço da sociedade, levantando o Brasil em direção à luz."
  },
  "Políticas Públicas e Governança": {
    image: "/20 - Políticas Públicas e Governança.png",
    description: "As quatro faixas coloridas representam saúde, alimentação, saneamento e moradia, guiadas por uma linha branca contínua que simboliza a governança pública. Um emblema que expressa o papel do Estado em dar direção e equilíbrio aos fluxos da vida social."
  },
  "Legislação e Regulamentação": {
    image: "/21 - Legislação e Regulamentação.png",
    description: "Este ícone representa a balança viva da justiça, símbolo da harmonia entre as forças sociais. A haste azul traduz a estrutura firme do Estado, o eixo vermelho expressa a energia da convivência coletiva, e os pratos verde e amarelo evocam o equilíbrio entre diversidade e liberdade — o resultado de uma regulação justa e de uma legislação que sustenta o bem comum."
  },
  "Eventos Oficiais e Cerimônias": {
    image: "/22 - Eventos Oficiais e Cerimônias.png",
    description: "As quatro faixas verticais, em vermelho, amarelo, verde e azul, evocam os pilares do Estado: Executivo, Legislativo, Judiciário e Sociedade Civil. No centro, uma linha dourada ascendente simboliza o eixo de equilíbrio e ordem que sustenta a vida pública. Com sua forma ereta e moderna, o pavilhão sugere grandeza e coesão, sem recorrer à pompa. Ele é uma homenagem à solenidade como linguagem do Estado — um símbolo do respeito às formas que sustentam o pacto nacional."
  },
  "Estatísticas e Dados Públicos": {
    image: "/23 - Estatísticas e Dados Públicos.png",
    description: "O ícone representa o compromisso nacional com a transparência e a escuta pública. A prancheta azul simboliza o registro oficial e a coleta de informações, enquanto as três casas — vermelha, verde e amarela — representam a diversidade dos lares brasileiros, protagonistas dos levantamentos de dados que fundamentam políticas públicas. A composição é sólida, equilibrada e minimalista, evocando o espírito do Censo e o papel do Estado em garantir acesso público e confiável às informações da sociedade."
  },
  "Minorias e Grupos Especiais": {
    image: "/24 - Minorias e Grupos Especiais.png",
    description: ""
  },
  "Habitação e Urbanismo": {
    image: "/25 - Habitação e Urbanismo.png",
    description: ""
  }
}

export default THEME_ICONS
