'use client'

import { useState } from 'react'
import {
  Camera,
  Check,
  Copy,
  HelpCircle,
  MonitorPlay,
  Radio,
  Settings2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const CLOUDFLARE_RTMPS = 'rtmps://live.cloudflare.com:443/live/'

const STEPS = [
  {
    icon: Radio,
    title: '1. Cloudflare — Live input',
    body: 'Dashboard Cloudflare → Stream → Live inputs → Create. Copiez la Stream Key RTMPS et le code Embed (ou l’UID du live).',
  },
  {
    icon: Settings2,
    title: '2. OBS — Stream',
    body: 'Paramètres → Stream → Service « Personnalisé ». Serveur = RTMPS Cloudflare. Clé = Stream Key Cloudflare (pas Facebook).',
  },
  {
    icon: Camera,
    title: '3. OBS — Caméra',
    body: 'Sources → + → Périphérique de capture vidéo. Ajoutez la webcam, puis Démarrer le streaming.',
  },
  {
    icon: MonitorPlay,
    title: '4. OMA — Page Live',
    body: 'Collez l’URL Embed (…/iframe) ou Customer + Live Input ID. Activez « Page Live » + « En direct », puis Enregistrer.',
  },
] as const

const OBS_TIPS = [
  { label: 'Débit vidéo', value: '1500–2500 Kbps (évitez 8000 si l’upload est limité)' },
  { label: 'Keyframe', value: '2 secondes' },
  { label: 'Résolution', value: '1280×720 pour tester' },
  { label: 'FPS', value: '30' },
  { label: 'Cloudflare OK', value: 'Encoding ~1500+ kbit/s et FPS ~25–30' },
] as const

const TROUBLESHOOTING = [
  {
    problem: 'Écran noir / « Stream has not started yet »',
    fix: 'OBS n’envoie pas encore vers Cloudflare, ou mauvais serveur/clé. Vérifiez le streaming + la clé Cloudflare.',
  },
  {
    problem: 'Ingress OK mais Encoding ~4 kbit/s / 4 FPS',
    fix: 'Débit OBS trop élevé pour votre connexion. Baissez à 1500–2500 Kbps, keyframe 2 s, relancez le stream.',
  },
  {
    problem: 'Où est « iframe » dans Cloudflare ?',
    fix: 'Cherchez Embed / Player / Click to copy. Collez seulement l’URL https://customer-…/…/iframe (pas tout le HTML).',
  },
] as const

export function ChallengeLiveSetupHelp({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false)
  const [openHelp, setOpenHelp] = useState(true)

  const copyRtmps = async () => {
    try {
      await navigator.clipboard.writeText(CLOUDFLARE_RTMPS)
      setCopied(true)
      toast.success('Serveur RTMPS copié')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier')
    }
  }

  return (
    <Card className={cn('space-y-4 p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
            <HelpCircle className="h-4 w-4 text-amber-700" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Guide Live — OBS → Cloudflare → OMA</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              OBS filme · Cloudflare diffuse · OMA affiche le lecteur au public.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-xs"
          onClick={() => setOpenHelp((v) => !v)}
        >
          {openHelp ? 'Réduire' : 'Afficher'}
        </Button>
      </div>

      {openHelp && (
        <div className="space-y-5">
          <ol className="space-y-3">
            {STEPS.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="flex gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Serveur OBS (à coller)
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="flex-1 break-all rounded-md bg-background px-3 py-2 font-mono text-xs">
                {CLOUDFLARE_RTMPS}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyRtmps}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="mr-1.5 h-4 w-4" />
                ) : (
                  <Copy className="mr-1.5 h-4 w-4" />
                )}
                Copier
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              La <strong>Stream Key</strong> se copie uniquement dans Cloudflare (ne la
              partagez pas).
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Réglages OBS recommandés
            </p>
            <ul className="space-y-1.5">
              {OBS_TIPS.map((tip) => (
                <li
                  key={tip.label}
                  className="flex flex-col gap-0.5 text-xs sm:flex-row sm:gap-2"
                >
                  <span className="w-28 shrink-0 font-medium text-foreground">
                    {tip.label}
                  </span>
                  <span className="text-muted-foreground">{tip.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Dépannage
            </p>
            <ul className="space-y-2">
              {TROUBLESHOOTING.map((item) => (
                <li
                  key={item.problem}
                  className="rounded-lg border border-border/50 px-3 py-2 text-xs"
                >
                  <p className="font-medium text-foreground">{item.problem}</p>
                  <p className="mt-1 text-muted-foreground">{item.fix}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  )
}
