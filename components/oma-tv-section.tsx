import { Button } from "@/components/ui/button"
import { Play, Youtube, Facebook, Instagram, Linkedin } from "lucide-react"

const videos = [
  {
    title: "Les secrets de l'art oratoire",
    thumbnail: "/public-speaking-video-thumbnail.jpg",
    duration: "15:30",
  },
  {
    title: "Leadership et influence",
    thumbnail: "/leadership-video-thumbnail.jpg",
    duration: "22:45",
  },
  {
    title: "Communication digitale efficace",
    thumbnail: "/placeholder.svg?height=400&width=600",
    duration: "18:20",
  },
]

export function OmaTvSection() {
  return (
    <section id="oma-tv" className="py-24 bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif font-bold text-4xl md:text-5xl mb-6 text-balance">OMA TV</h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto text-pretty">
            Découvrez nos émissions et vidéos inspirantes pour développer vos compétences en communication et leadership
          </p>
        </div>

        {/* Featured Video */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl group">
            <img
              src="/placeholder.svg?height=720&width=1280"
              alt="OMA TV Featured"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/30 transition-colors flex items-center justify-center">
              <button className="w-20 h-20 bg-gold rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                <Play className="h-10 w-10 text-primary ml-1" fill="currentColor" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {videos.map((video, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                  <button className="w-12 h-12 bg-gold rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-primary ml-0.5" fill="currentColor" />
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                  {video.duration}
                </div>
              </div>
              <div className="bg-white p-4">
                <h3 className="font-semibold text-gray-900">{video.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="text-center mt-12">
          <p className="text-lg mb-6">Suivez-nous sur nos réseaux sociaux</p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gold text-gold hover:bg-gold hover:text-primary bg-transparent text-sm sm:text-base"
            >
              <Youtube className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">YouTube</span>
              <span className="sm:hidden">YT</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gold text-gold hover:bg-gold hover:text-primary bg-transparent text-sm sm:text-base"
            >
              <Facebook className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Facebook</span>
              <span className="sm:hidden">FB</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gold text-gold hover:bg-gold hover:text-primary bg-transparent text-sm sm:text-base"
            >
              <Instagram className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Instagram</span>
              <span className="sm:hidden">IG</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gold text-gold hover:bg-gold hover:text-primary bg-transparent text-sm sm:text-base"
            >
              <Linkedin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">LinkedIn</span>
              <span className="sm:hidden">LI</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
