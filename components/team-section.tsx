export function TeamSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-6 text-balance">Notre équipe</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Des experts passionnés au service de votre développement
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <img
                src="/images/coach-bin-professional.jpg"
                alt="Coach Bin Adan"
                className="w-64 h-64 rounded-lg object-cover shadow-xl border-4 border-gold"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold rounded-lg -z-10" />
            </div>
            <h3 className="font-serif font-bold text-3xl mb-2 text-foreground">Coach Bin Adan</h3>
            <p className="text-gold font-semibold mb-4 text-lg">Fondateur & Directeur Réseau OMA</p>
            <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
              Expert reconnu en art oratoire et communication avec plus de 15 ans d'expérience. Passionné par le
              développement du leadership et l'accompagnement des talents vers l'excellence. Créateur du Réseau OMA en
              2019, il a formé plus de 1000 professionnels à travers 6 pays.
            </p>
          </div>

          <div className="text-center">
            <div className="relative inline-block mb-6">
              <img
                src="/images/leader-albin-speaking.jpg"
                alt="Leader Albin-Jovial"
                className="w-64 h-64 rounded-lg object-cover shadow-xl border-4 border-gold"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold rounded-lg -z-10" />
            </div>
            <h3 className="font-serif font-bold text-3xl mb-2 text-foreground">Leader bin</h3>
            <p className="text-gold font-semibold mb-4 text-lg">Directeur OMA TV</p>
            <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
              Spécialiste en médias et communication digitale, il dirige la production de contenus inspirants pour OMA
              TV. Expert en stratégie de contenu et storytelling, il crée des programmes qui touchent et transforment
              des milliers de personnes à travers le monde.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
