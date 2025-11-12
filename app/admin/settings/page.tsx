"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { toast } from "sonner"
import { Plus, Trash2, Save, RotateCcw } from "lucide-react"

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    site_title: "Réseau OMA & OMA TV",
    site_description: "Plateforme internationale de formation en communication",
    logo_url: "/placeholder-logo.png",
    primary_color: "#f97316",
    secondary_color: "#1a1a1a",
    font_family: "Playfair Display",
    // Couleurs shadcn dynamiques
    colorBackground: "#fefcfb",
    colorForeground: "#1a1a1a",
    colorCard: "#ffffff",
    colorCardForeground: "#1a1a1a",
    colorPrimary: "#0a0a0a",
    colorPrimaryForeground: "#fefcfb",
    colorSecondary: "#f97316",
    colorSecondaryForeground: "#1a1a1a",
    colorMuted: "#f7f5f3",
    colorMutedForeground: "#71717a",
    colorAccent: "#f97316",
    colorAccentForeground: "#1a1a1a",
    colorBorder: "#e4e4e7",
    colorInput: "#ffffff",
    colorRing: "#f97316",
    colorGold: "#f97316",
    colorGoldDark: "#ea580c",
    colorGoldLight: "#fb923c",
    email: "",
    telephones: [""] as string[],
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
    linkedin: "",
    // Paramètres SMTP
    smtp_host: "smtp.gmail.com",
    smtp_port: "587",
    smtp_secure: "false",
    smtp_user: "",
    smtp_pass: "", // Ne sera pas affiché, seulement pour modification
    idle_timeout_minutes: 15, // Temps d'inactivité avant verrouillage (en minutes)
    wakeup_ping_interval_minutes: 5, // Intervalle pour le wake-up ping (en minutes)
  })

  const [isLoading, setIsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      
      // Charger les settings et contacts séparément
      const [settingsRes, contactRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/contact'),
      ])

      if (!settingsRes.ok || !contactRes.ok) {
        throw new Error('Failed to load data')
      }

      const settingsData = await settingsRes.json()
      const contactData = await contactRes.json()

        if (settingsData.success && settingsData.data) {
          const loadedSettings = settingsData.data
          setSettings((prev) => ({
            ...prev,
            site_title: loadedSettings.siteTitle || prev.site_title,
            site_description: loadedSettings.siteDescription || prev.site_description,
            logo_url: loadedSettings.logoUrl || prev.logo_url,
            primary_color: loadedSettings.primaryColor || prev.primary_color,
            secondary_color: loadedSettings.secondaryColor || prev.secondary_color,
            font_family: loadedSettings.fontFamily || prev.font_family,
            // Couleurs shadcn dynamiques
            colorBackground: loadedSettings.colorBackground || prev.colorBackground,
            colorForeground: loadedSettings.colorForeground || prev.colorForeground,
            colorCard: loadedSettings.colorCard || prev.colorCard,
            colorCardForeground: loadedSettings.colorCardForeground || prev.colorCardForeground,
            colorPrimary: loadedSettings.colorPrimary || prev.colorPrimary,
            colorPrimaryForeground: loadedSettings.colorPrimaryForeground || prev.colorPrimaryForeground,
            colorSecondary: loadedSettings.colorSecondary || prev.colorSecondary,
            colorSecondaryForeground: loadedSettings.colorSecondaryForeground || prev.colorSecondaryForeground,
            colorMuted: loadedSettings.colorMuted || prev.colorMuted,
            colorMutedForeground: loadedSettings.colorMutedForeground || prev.colorMutedForeground,
            colorAccent: loadedSettings.colorAccent || prev.colorAccent,
            colorAccentForeground: loadedSettings.colorAccentForeground || prev.colorAccentForeground,
            colorBorder: loadedSettings.colorBorder || prev.colorBorder,
            colorInput: loadedSettings.colorInput || prev.colorInput,
            colorRing: loadedSettings.colorRing || prev.colorRing,
            colorGold: loadedSettings.colorGold || prev.colorGold,
            colorGoldDark: loadedSettings.colorGoldDark || prev.colorGoldDark,
            colorGoldLight: loadedSettings.colorGoldLight || prev.colorGoldLight,
            // Paramètres SMTP
            smtp_host: loadedSettings.smtpHost || prev.smtp_host,
            smtp_port: loadedSettings.smtpPort || prev.smtp_port,
            smtp_secure: loadedSettings.smtpSecure || prev.smtp_secure,
            smtp_user: loadedSettings.smtpUser || prev.smtp_user,
            // Ne pas charger le mot de passe pour des raisons de sécurité
            idle_timeout_minutes: loadedSettings.idleTimeoutMinutes || prev.idle_timeout_minutes,
            wakeup_ping_interval_minutes: loadedSettings.wakeUpPingIntervalMinutes || prev.wakeup_ping_interval_minutes,
          }))
        }

      if (contactData.success && contactData.data) {
        const loadedContact = contactData.data
        setSettings((prev) => ({
          ...prev,
          email: loadedContact.email || "",
          telephones: Array.isArray(loadedContact.telephones) 
            ? (loadedContact.telephones.length > 0 ? loadedContact.telephones : [""])
            : [""],
          facebook: loadedContact.facebook || "",
          instagram: loadedContact.instagram || "",
          youtube: loadedContact.youtube || "",
          twitter: loadedContact.twitter || "",
          linkedin: loadedContact.linkedin || "",
        }))
      }
    } catch (err) {
      console.error("[Admin] Erreur chargement paramètres:", err)
      toast.error("Impossible de charger les paramètres")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Préparer les payloads séparés
      const settingsPayload = {
        siteTitle: settings.site_title,
        siteDescription: settings.site_description,
        logoUrl: settings.logo_url,
        primaryColor: settings.primary_color,
        secondaryColor: settings.secondary_color,
        fontFamily: settings.font_family,
        // Couleurs shadcn dynamiques
        colorBackground: settings.colorBackground,
        colorForeground: settings.colorForeground,
        colorCard: settings.colorCard,
        colorCardForeground: settings.colorCardForeground,
        colorPrimary: settings.colorPrimary,
        colorPrimaryForeground: settings.colorPrimaryForeground,
        colorSecondary: settings.colorSecondary,
        colorSecondaryForeground: settings.colorSecondaryForeground,
        colorMuted: settings.colorMuted,
        colorMutedForeground: settings.colorMutedForeground,
        colorAccent: settings.colorAccent,
        colorAccentForeground: settings.colorAccentForeground,
        colorBorder: settings.colorBorder,
        colorInput: settings.colorInput,
        colorRing: settings.colorRing,
        colorGold: settings.colorGold,
        colorGoldDark: settings.colorGoldDark,
        colorGoldLight: settings.colorGoldLight,
        // Paramètres SMTP (seulement si modifiés)
        smtpHost: settings.smtp_host,
        smtpPort: settings.smtp_port,
        smtpSecure: settings.smtp_secure,
        smtpUser: settings.smtp_user,
        smtpPass: settings.smtp_pass || undefined, // Ne pas envoyer si vide
        idleTimeoutMinutes: parseInt(settings.idle_timeout_minutes.toString()) || 15,
        wakeUpPingIntervalMinutes: parseInt(settings.wakeup_ping_interval_minutes.toString()) || 5,
      }

      const contactPayload = {
        email: settings.email || null,
        telephones: settings.telephones.filter(Boolean).length > 0 
          ? settings.telephones.filter(Boolean) 
          : null,
        facebook: settings.facebook || null,
        instagram: settings.instagram || null,
        youtube: settings.youtube || null,
        twitter: settings.twitter || null,
        linkedin: settings.linkedin || null,
      }

      // Sauvegarder en parallèle
      const [settingsRes, contactRes] = await Promise.all([
        fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settingsPayload),
        }),
        fetch('/api/admin/contact', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactPayload),
        }),
      ])

      if (!settingsRes.ok || !contactRes.ok) {
        const failedRes = settingsRes.ok ? contactRes : settingsRes
        const errorData = await failedRes.json()
        
        // Afficher les détails de validation si disponibles
        if (errorData.details && Array.isArray(errorData.details)) {
          const details = errorData.details.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ')
          throw new Error(`Données invalides: ${details}`)
        }
        
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
      }

      const settingsData = await settingsRes.json()
      const contactData = await contactRes.json()

      if (settingsData.success && contactData.success) {
        setMessage({ type: "success", text: "Paramètres du site mis à jour avec succès" })
        toast.success("Paramètres sauvegardés avec succès")
        
        // Recharger les données pour afficher les modifications immédiatement
        await loadSettings()
        
        // Déclencher un événement pour que les composants client (Footer, ContactSection) se mettent à jour
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('settings-updated'))
          // Déclencher aussi un événement pour mettre à jour les couleurs
          window.dispatchEvent(new CustomEvent('colors-updated'))
        }
        
        setTimeout(() => setMessage(null), 3000)
      } else {
        throw new Error('Erreur lors de la sauvegarde')
      }
    } catch (err: any) {
      console.error("[Admin] Erreur sauvegarde paramètres:", err)
      setMessage({ type: "error", text: err.message || "Erreur lors de la mise à jour des paramètres" })
      toast.error("Erreur lors de la sauvegarde des paramètres")
    } finally {
      setLoading(false)
    }
  }

  const addTelephone = () => {
    setSettings(prev => ({
      ...prev,
      telephones: [...prev.telephones, '']
    }))
  }

  const removeTelephone = (index: number) => {
    setSettings(prev => ({
      ...prev,
      telephones: prev.telephones.filter((_, i) => i !== index)
    }))
  }

  const updateTelephone = (index: number, value: string) => {
    setSettings(prev => ({
      ...prev,
      telephones: prev.telephones.map((t, i) => i === index ? value : t)
    }))
  }

  // Fonction pour réinitialiser les couleurs au thème par défaut
  const resetToDefaultTheme = () => {
    const defaultColors = {
      colorBackground: '#fefcfb',
      colorForeground: '#1a1a1a',
      colorCard: '#ffffff',
      colorCardForeground: '#1a1a1a',
      colorPrimary: '#0a0a0a',
      colorPrimaryForeground: '#fefcfb',
      colorSecondary: '#f97316',
      colorSecondaryForeground: '#1a1a1a',
      colorMuted: '#f7f5f3',
      colorMutedForeground: '#71717a',
      colorAccent: '#f97316',
      colorAccentForeground: '#1a1a1a',
      colorBorder: '#e4e4e7',
      colorInput: '#ffffff',
      colorRing: '#f97316',
      colorGold: '#f97316',
      colorGoldDark: '#ea580c',
      colorGoldLight: '#fb923c',
      primaryColor: '#f97316',
      secondaryColor: '#1a1a1a',
    }

    setSettings(prev => ({
      ...prev,
      ...defaultColors,
    }))

    toast.success('Thème réinitialisé aux valeurs par défaut')
  }

  if (isLoading) {
    return <PageSkeleton type="default" showHeader={true} />
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Paramètres du site"
        description="Gérez les paramètres généraux, les contacts et la configuration SMTP"
        action={{
          label: "Enregistrer",
          onClick: () => {
            const form = document.querySelector('form')
            if (form) {
              const event = new Event('submit', { bubbles: true, cancelable: true })
              form.dispatchEvent(event)
            }
          },
          icon: <Save className="w-4 h-4" />,
        }}
      />

      {message && (
        <div
          className={`p-4 rounded-xl shadow-soft ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Layout en deux colonnes */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Informations générales et SMTP */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations du site */}
          <Card className="border-0 shadow-soft bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Informations du site</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <InputField label="Titre du site" name="site_title" value={settings.site_title} onChange={handleChange} />
              <InputField
                label="Description du site"
                name="site_description"
                value={settings.site_description}
                onChange={handleChange}
              />
              <InputField label="URL du logo" name="logo_url" value={settings.logo_url} onChange={handleChange} />

              {/* Couleurs de base (conservées pour compatibilité) */}
              <div className="grid grid-cols-2 gap-6">
                <ColorInput label="Couleur primaire (legacy)" name="primary_color" value={settings.primary_color} onChange={handleChange} />
                <ColorInput label="Couleur secondaire (legacy)" name="secondary_color" value={settings.secondary_color} onChange={handleChange} />
              </div>

              {/* Police */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Police d'écriture</label>
                <select
                  name="font_family"
                  value={settings.font_family}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Thème et Couleurs shadcn */}
          <Card className="border-0 shadow-soft bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">Thème et Couleurs (shadcn)</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Personnalisez les couleurs du site côté public/visiteur. Les modifications sont appliquées immédiatement après sauvegarde.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetToDefaultTheme}
                  className="gap-2 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Thème par défaut
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Couleurs principales */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Couleurs principales</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Couleurs de base pour le fond et le texte principal du site
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <ColorInput label="Fond (Background)" name="colorBackground" value={settings.colorBackground} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Couleur de fond principale des pages (recommandé: clair, beige/crème)</p>
                  </div>
                  <div>
                    <ColorInput label="Texte (Foreground)" name="colorForeground" value={settings.colorForeground} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Couleur du texte principal (recommandé: sombre pour lisibilité)</p>
                  </div>
                  <div>
                    <ColorInput label="Cartes (Card)" name="colorCard" value={settings.colorCard} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Fond des cartes et conteneurs (recommandé: blanc)</p>
                  </div>
                  <div>
                    <ColorInput label="Texte cartes" name="colorCardForeground" value={settings.colorCardForeground} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Couleur du texte dans les cartes (recommandé: sombre)</p>
                  </div>
                </div>
              </div>

              {/* Couleurs primaires et secondaires */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Couleurs primaires et secondaires</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Couleurs pour les sections importantes (Hero, Footer) et les accents (boutons, liens)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <ColorInput label="Primaire (Hero/Footer)" name="colorPrimary" value={settings.colorPrimary} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Couleur de fond pour Hero, OMA TV, Newsletter, Footer (recommandé: noir foncé)</p>
                  </div>
                  <div>
                    <ColorInput label="Texte primaire" name="colorPrimaryForeground" value={settings.colorPrimaryForeground} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Couleur du texte sur fond primaire (recommandé: blanc/clair)</p>
                  </div>
                  <div>
                    <ColorInput label="Secondaire (Accents)" name="colorSecondary" value={settings.colorSecondary} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Couleur d'accent pour boutons et éléments importants (recommandé: orange/or)</p>
                  </div>
                  <div>
                    <ColorInput label="Texte secondaire" name="colorSecondaryForeground" value={settings.colorSecondaryForeground} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Couleur du texte sur fond secondaire (recommandé: sombre)</p>
                  </div>
                </div>
              </div>

              {/* Accents et neutres */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Accents et neutres</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Couleurs pour les sections de fond alternées et les éléments d'accentuation subtils
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <ColorInput label="Muted (Fond doux)" name="colorMuted" value={settings.colorMuted} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Fond alterné pour certaines sections (recommandé: très clair, légèrement gris)</p>
                  </div>
                  <div>
                    <ColorInput label="Texte muted" name="colorMutedForeground" value={settings.colorMutedForeground} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Texte secondaire, moins important (recommandé: gris moyen)</p>
                  </div>
                  <div>
                    <ColorInput label="Accent" name="colorAccent" value={settings.colorAccent} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Couleur d'accent pour hover et éléments interactifs (recommandé: orange/or)</p>
                  </div>
                  <div>
                    <ColorInput label="Texte accent" name="colorAccentForeground" value={settings.colorAccentForeground} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Texte sur éléments accent (recommandé: sombre)</p>
                  </div>
                </div>
              </div>

              {/* Bordures et inputs */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Bordures et inputs</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Couleurs pour les bordures, champs de formulaire et états de focus
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <ColorInput label="Bordure" name="colorBorder" value={settings.colorBorder} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Couleur des bordures des cartes et conteneurs (recommandé: gris clair)</p>
                  </div>
                  <div>
                    <ColorInput label="Input" name="colorInput" value={settings.colorInput} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Fond des champs de formulaire (recommandé: blanc)</p>
                  </div>
                  <div>
                    <ColorInput label="Ring (Focus)" name="colorRing" value={settings.colorRing} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Couleur du contour de focus sur les inputs (recommandé: orange/or)</p>
                  </div>
                </div>
              </div>

              {/* Couleurs orange/or (gold) */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Couleurs Orange/Or (Gold)</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Couleurs spéciales pour les éléments orange/or du thème OMA (logo, boutons, accents)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <ColorInput label="Gold (Principal)" name="colorGold" value={settings.colorGold} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Couleur orange/or principale (logo, boutons principaux, accents)</p>
                  </div>
                  <div>
                    <ColorInput label="Gold Dark" name="colorGoldDark" value={settings.colorGoldDark} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Version foncée pour hover et états actifs (recommandé: orange foncé)</p>
                  </div>
                  <div>
                    <ColorInput label="Gold Light" name="colorGoldLight" value={settings.colorGoldLight} onChange={handleChange} />
                    <p className="text-xs text-muted-foreground mt-1">Version claire pour effets subtils (recommandé: orange clair)</p>
                  </div>
                </div>
              </div>

              {/* Note d'aide */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">💡 Astuce</p>
                <p className="text-xs text-blue-800">
                  Pour un rendu optimal, assurez-vous que les couleurs de texte (foreground) contrastent bien avec leurs couleurs de fond. 
                  Utilisez des outils en ligne pour vérifier le contraste (WCAG AA recommandé).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configuration SMTP */}
          <Card className="border-0 shadow-soft bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Configuration Email (SMTP)</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configurez les paramètres SMTP pour l'envoi d'emails. Ces paramètres sont utilisés pour envoyer les messages de contact.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputField 
                label="Serveur SMTP (Host)" 
                name="smtp_host" 
                value={settings.smtp_host} 
                onChange={handleChange} 
                placeholder="smtp.gmail.com" 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="Port SMTP" 
                  name="smtp_port" 
                  value={settings.smtp_port} 
                  onChange={handleChange} 
                  placeholder="587" 
                  type="number"
                />
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Connexion sécurisée
                  </label>
                  <select
                    name="smtp_secure"
                    value={settings.smtp_secure}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="false">Non (TLS - Port 587)</option>
                    <option value="true">Oui (SSL - Port 465)</option>
                  </select>
                </div>
              </div>

              <InputField 
                label="Email SMTP (User)" 
                name="smtp_user" 
                value={settings.smtp_user} 
                onChange={handleChange} 
                placeholder="votre-email@gmail.com" 
                type="email"
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe SMTP (App Password)
                </label>
                <Input
                  type="password"
                  name="smtp_pass"
                  value={settings.smtp_pass}
                  onChange={handleChange}
                  placeholder="Laissez vide pour ne pas modifier"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pour Gmail, utilisez un "App Password" généré depuis votre compte Google.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Paramètres de sécurité */}
          <Card className="border-0 shadow-soft bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Paramètres de sécurité</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configurez le verrouillage automatique de la session après inactivité
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Temps d'inactivité avant verrouillage (minutes)
                </label>
                <Input
                  type="number"
                  name="idle_timeout_minutes"
                  value={settings.idle_timeout_minutes}
                  onChange={handleChange}
                  min="5"
                  max="120"
                  placeholder="15"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Après cette durée d'inactivité, la session sera verrouillée et l'utilisateur devra entrer son mot de passe pour continuer. 
                  Si l'inactivité dépasse 1 heure, l'utilisateur sera redirigé vers la page de connexion. (Recommandé: 15-30 minutes)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Intervalle de wake-up ping (minutes)
                </label>
                <Input
                  type="number"
                  name="wakeup_ping_interval_minutes"
                  value={settings.wakeup_ping_interval_minutes}
                  onChange={handleChange}
                  min="1"
                  max="60"
                  placeholder="5"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Intervalle pour envoyer une requête à la base de données afin de la maintenir active et éviter qu'elle ne s'endorme. 
                  Une petite requête sera envoyée automatiquement toutes les X minutes. (Recommandé: 5-10 minutes)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite - Informations de contact et réseaux sociaux */}
        <div className="space-y-6">
          {/* Box d'informations utiles */}
          <Card className="border-0 shadow-soft bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Informations importantes</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Les modifications sont appliquées immédiatement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Les paramètres SMTP sont cryptés</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Les réseaux sociaux sont optionnels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Testez les emails après modification</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Informations de contact */}
          <Card className="border-0 shadow-soft bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Informations de contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputField 
                label="Email du site" 
                name="email" 
                value={settings.email} 
                onChange={handleChange} 
                placeholder="contact@votresite.com" 
                type="email"
              />

              {/* Téléphones multiples */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Numéros de téléphone
                </label>
                <div className="space-y-2">
                  {settings.telephones.map((tel, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="tel"
                        value={tel}
                        onChange={(e) => updateTelephone(index, e.target.value)}
                        placeholder="+243900000000"
                        className="flex-1"
                      />
                      {settings.telephones.length > 1 ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTelephone(index)}
                          className="px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : null}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTelephone}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un numéro
                  </Button>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Réseaux sociaux</h4>
                <div className="space-y-3">
                  <InputField 
                    label="Facebook" 
                    name="facebook" 
                    value={settings.facebook} 
                    onChange={handleChange} 
                    placeholder="https://facebook.com/..." 
                    type="url"
                  />
                  <InputField 
                    label="Instagram" 
                    name="instagram" 
                    value={settings.instagram} 
                    onChange={handleChange} 
                    placeholder="https://instagram.com/..." 
                    type="url"
                  />
                  <InputField 
                    label="YouTube" 
                    name="youtube" 
                    value={settings.youtube} 
                    onChange={handleChange} 
                    placeholder="https://youtube.com/..." 
                    type="url"
                  />
                  <InputField 
                    label="Twitter (X)" 
                    name="twitter" 
                    value={settings.twitter} 
                    onChange={handleChange} 
                    placeholder="https://twitter.com/..." 
                    type="url"
                  />
                  <InputField 
                    label="LinkedIn" 
                    name="linkedin" 
                    value={settings.linkedin} 
                    onChange={handleChange} 
                    placeholder="https://linkedin.com/..." 
                    type="url"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bouton de sauvegarde - Full width */}
        <div className="lg:col-span-3 flex justify-end pt-4">
          <Button type="submit" disabled={loading} className="gradient-purple text-white border-0 px-8">
            {loading ? "Sauvegarde en cours..." : "Sauvegarder les modifications"}
          </Button>
        </div>
      </form>
    </div>
  )
}

// === Composants utilitaires internes ===
function InputField({ label, name, value, onChange, placeholder = "", type = "text" }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <Input 
        type={type}
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        className="w-full" 
      />
    </div>
  )
}

function ColorInput({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-2">{label}</label>
      <div className="flex gap-3">
        <input 
          type="color" 
          name={name} 
          value={value || '#ffffff'} 
          onChange={onChange} 
          className="w-16 h-10 rounded cursor-pointer border border-border" 
        />
        <Input 
          type="text" 
          name={name} 
          value={value || ''} 
          onChange={onChange} 
          className="flex-1 font-mono text-sm" 
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

