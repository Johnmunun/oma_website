import { Sparkles } from "lucide-react"

export function AboutSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">À propos du Réseau OMA</span>
          </div>
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-6 text-balance">
            Révéler votre potentiel, accompagner vos talents
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-pretty">
            Créé en 2019 par le Coach Bin Adan, le Réseau OMA est une plateforme internationale dédiée à l'art oratoire,
            la communication et le leadership. Notre mission : accompagner les talents et révéler leur potentiel à
            travers des formations de qualité et un accompagnement personnalisé.
          </p>
          <blockquote className="text-2xl font-serif italic text-gold border-l-4 border-gold pl-6 my-8">
            "Savoir parler, c'est savoir agir."
          </blockquote>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-5xl font-bold text-gold mb-2">2019</div>
            <p className="text-muted-foreground">Année de création</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-gold mb-2">6</div>
            <p className="text-muted-foreground">Pays en Afrique, Asie et Europe</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-gold mb-2">1000+</div>
            <p className="text-muted-foreground">Talents accompagnés</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-5xl mx-auto">
          <div className="bg-card rounded-lg p-8 shadow-lg border border-border">
            <img
              src="/images/leader-albin-speaking.jpg"
              alt="Coach Bin Adan"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gold"
            />
            <h3 className="font-serif font-bold text-2xl text-center mb-2">Coach Bin Adan</h3>
            <p className="text-gold text-center mb-4">Fondateur & Directeur Réseau OMA</p>
            <p className="text-muted-foreground text-center leading-relaxed">
              Expert en art oratoire et communication, passionné par le développement du leadership et l'accompagnement
              des talents.
            </p>
          </div>
          <div className="bg-card rounded-lg p-8 shadow-lg border border-border">
            <img
              src="/images/coach-bin-professional.jpg"
              alt="Leader Albin-Jovial"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gold"
            />
            <h3 className="font-serif font-bold text-2xl text-center mb-2">Leader bin</h3>
            <p className="text-gold text-center mb-4">Directeur OMA TV</p>
            <p className="text-muted-foreground text-center leading-relaxed">
              Spécialiste en médias et communication digitale, il dirige la production de contenus inspirants pour OMA
              TV.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
