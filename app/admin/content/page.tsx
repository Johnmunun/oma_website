/**
 * @file app/admin/content/page.tsx
 * @description Gestion du contenu principal du site (hero, about, sections)
 * Permet de modifier logo, couleurs, polices, texte et images
 * @todo Intégrer avec l'API backend pour persister les changements
 */

"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Palette, Type, ImageIcon, Loader2 } from "lucide-react"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { toast } from "sonner"
import { LogoUpload } from "@/components/admin/logo-upload"

interface SiteSettings {
  // Logo et branding
  logoUrl: string
  logoAlt: string
  coverImageUrl: string | null // Photo de couverture pour la bannière
  heroImageUrl: string | null // Image de fond pour la section hero

  // Couleurs principales
  primaryColor: string
  secondaryColor: string
  accentColor: string

  // Typographie
  headingFont: string
  bodyFont: string

  // Contenu
  heroTitle: string
  heroSubtitle: string
  aboutTitle: string
  aboutDescription: string
}

export default function AdminContentPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    logoUrl: "/images/logo.png",
    logoAlt: "OMA Logo",
    coverImageUrl: null,
    heroImageUrl: null,
    primaryColor: "#1a1a1a",
    secondaryColor: "#d4af37",
    accentColor: "#f5f5f5",
    headingFont: "Playfair Display",
    bodyFont: "Poppins",
    heroTitle: "Réseau OMA & OMA TV",
    heroSubtitle: "Formation professionnelle en communication",
    aboutTitle: "À propos de nous",
    aboutDescription: "Développer vos compétences...",
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"branding" | "typography" | "content">("branding")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        
        // Charger les settings depuis l'API
        const res = await fetch('/api/admin/settings', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load settings')
        
        const data = await res.json()
        if (data.success && data.data) {
          const loadedSettings = data.data
          setSettings((prev) => ({
            ...prev,
            logoUrl: loadedSettings.logoUrl || prev.logoUrl,
            coverImageUrl: loadedSettings.coverImageUrl || prev.coverImageUrl,
            heroImageUrl: loadedSettings.heroImageUrl || prev.heroImageUrl,
            logoAlt: loadedSettings.siteTitle || prev.logoAlt,
            primaryColor: loadedSettings.primaryColor || prev.primaryColor,
            secondaryColor: loadedSettings.secondaryColor || prev.secondaryColor,
            headingFont: loadedSettings.fontFamily || prev.headingFont,
          }))
        }
      } catch (err) {
        console.error('[Admin] Erreur chargement paramètres:', err)
        toast.error('Impossible de charger les paramètres')
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
    
    // Écouter les événements de mise à jour
    const handleSettingsUpdate = () => {
      loadSettings()
    }
    
    window.addEventListener('settings-updated', handleSettingsUpdate)
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate)
    }
  }, [])

  /**
   * Sauvegarder les modifications
   */
  const handleSave = async () => {
    if (isSaving) return // Empêcher les doubles clics
    
    try {
      setIsSaving(true)
      
      // Valider et formater les couleurs (doivent être au format #RRGGBB)
      const formatColor = (color: string): string => {
        if (!color) return '#1a1a1a' // Valeur par défaut
        // Si la couleur commence par #, vérifier qu'elle a 7 caractères (#RRGGBB)
        if (color.startsWith('#')) {
          // Si elle a 4 caractères (#RGB), convertir en #RRGGBB
          if (color.length === 4) {
            return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
          }
          // Si elle a déjà 7 caractères, la retourner telle quelle
          if (color.length === 7) {
            return color
          }
        }
        // Si pas de #, l'ajouter et compléter si nécessaire
        return color.startsWith('#') ? color : `#${color}`
      }
      
      // Préparer les données à envoyer
      const payload = {
        siteTitle: settings.logoAlt || 'Réseau OMA & OMA TV',
        siteDescription: settings.aboutDescription || '',
        logoUrl: settings.logoUrl || null,
        coverImageUrl: settings.coverImageUrl || null,
        heroImageUrl: settings.heroImageUrl || null,
        primaryColor: formatColor(settings.primaryColor),
        secondaryColor: formatColor(settings.secondaryColor),
        fontFamily: settings.headingFont || 'Playfair Display',
      }
      
      console.log('[Admin] Envoi des paramètres:', payload)
      
      // Sauvegarder via l'API admin/settings
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      // Lire la réponse une seule fois
      let responseData
      try {
        const text = await res.text()
        responseData = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error('[Admin] Erreur parsing réponse:', parseError)
        throw new Error('Réponse invalide du serveur')
      }
      
      console.log('[Admin] Réponse API:', {
        status: res.status,
        ok: res.ok,
        data: responseData,
      })
      
      if (!res.ok) {
        const errorMessage = 
          responseData?.error || 
          responseData?.message || 
          `Erreur ${res.status}: ${res.statusText}` ||
          'Erreur lors de la mise à jour'
        
        console.error('[Admin] Erreur sauvegarde paramètres:', {
          status: res.status,
          statusText: res.statusText,
          error: errorMessage,
          details: responseData?.details,
          fullResponse: responseData,
        })
        
        throw new Error(errorMessage)
      }
      
      if (responseData.success) {
        setSaved(true)
        toast.success('Paramètres sauvegardés avec succès')
        
        // Déclencher l'événement de mise à jour
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('settings-updated'))
          window.dispatchEvent(new CustomEvent('colors-updated'))
        }
        
        setTimeout(() => setSaved(false), 3000)
      } else {
        throw new Error(responseData.error || responseData.message || 'Erreur lors de la sauvegarde')
      }
    } catch (err: any) {
      console.error('[Admin] Erreur sauvegarde paramètres:', err)
      const errorMessage = err.message || 'Erreur lors de la sauvegarde des paramètres'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Sauvegarder automatiquement après l'upload du logo
   */
  const handleSaveAfterUpload = async (url: string | null, field: "logoUrl" | "coverImageUrl" | "heroImageUrl" = "logoUrl") => {
    try {
      // Valider et formater les couleurs (doivent être au format #RRGGBB)
      const formatColor = (color: string): string => {
        if (!color) return '#1a1a1a' // Valeur par défaut
        // Si la couleur commence par #, vérifier qu'elle a 7 caractères (#RRGGBB)
        if (color.startsWith('#')) {
          // Si elle a 4 caractères (#RGB), convertir en #RRGGBB
          if (color.length === 4) {
            return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
          }
          // Si elle a déjà 7 caractères, la retourner telle quelle
          if (color.length === 7) {
            return color
          }
        }
        // Si pas de #, l'ajouter et compléter si nécessaire
        return color.startsWith('#') ? color : `#${color}`
      }
      
      const updateData: any = {
        siteTitle: settings.logoAlt || 'Réseau OMA & OMA TV',
        siteDescription: settings.aboutDescription || '',
        logoUrl: field === 'logoUrl' ? (url || null) : (settings.logoUrl || null),
        coverImageUrl: field === 'coverImageUrl' ? (url || null) : (settings.coverImageUrl || null),
        heroImageUrl: field === 'heroImageUrl' ? (url || null) : (settings.heroImageUrl || null),
        primaryColor: formatColor(settings.primaryColor),
        secondaryColor: formatColor(settings.secondaryColor),
        fontFamily: settings.headingFont || 'Playfair Display',
      }
      
      console.log('[Admin] Envoi sauvegarde automatique:', {
        field,
        url,
        updateData,
      })
      
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      
      // Lire la réponse de manière robuste
      let responseData
      try {
        const text = await res.text()
        responseData = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error('[Admin] Erreur parsing réponse sauvegarde automatique:', parseError)
        throw new Error('Réponse invalide du serveur')
      }
      
      console.log('[Admin] Réponse sauvegarde automatique:', {
        status: res.status,
        ok: res.ok,
        data: responseData,
      })
      
      if (!res.ok) {
        const errorMessage = 
          responseData?.error || 
          responseData?.message || 
          `Erreur ${res.status}: ${res.statusText}` ||
          'Erreur lors de la mise à jour'
        
        console.error('[Admin] Erreur sauvegarde automatique:', {
          status: res.status,
          statusText: res.statusText,
          error: errorMessage,
          details: responseData?.details,
          fullResponse: responseData,
        })
        
        // Afficher un toast d'erreur pour informer l'utilisateur
        toast.error(`Erreur lors de la sauvegarde: ${errorMessage}`)
        return
      }
      
      if (responseData.success) {
        // Mettre à jour le state local avec les nouvelles valeurs
        if (field === 'logoUrl') {
          setSettings((prev) => ({ ...prev, logoUrl: url || prev.logoUrl }))
        } else if (field === 'coverImageUrl') {
          setSettings((prev) => ({ ...prev, coverImageUrl: url }))
        }
        
        // Déclencher l'événement de mise à jour
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('settings-updated'))
          window.dispatchEvent(new CustomEvent('colors-updated'))
        }
        
        toast.success(`${field === 'logoUrl' ? 'Logo' : 'Photo de couverture'} sauvegardé avec succès`)
      } else {
        const errorMsg = responseData.error || responseData.message || 'Erreur lors de la sauvegarde'
        console.error('[Admin] Sauvegarde automatique échouée:', errorMsg)
        toast.error(`Erreur: ${errorMsg}`)
      }
    } catch (err: any) {
      console.error('[Admin] Erreur sauvegarde automatique logo:', err)
      toast.error(`Erreur lors de la sauvegarde: ${err.message || 'Erreur inconnue'}`)
    }
  }

  if (isLoading) {
    return <PageSkeleton type="default" showHeader={true} />
  }

  const handleChange = (key: keyof SiteSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion du contenu</h1>
          <p className="text-muted-foreground mt-1">Personnalisez l'apparence et le contenu de votre site</p>
        </div>
        <Button 
          size="lg" 
          onClick={handleSave} 
          disabled={isSaving}
          className={`gap-2 transition-all ${saved ? "bg-green-600" : ""}`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sauvegarde en cours...
            </>
          ) : saved ? (
            <>
              <Save className="w-4 h-4" />
              Sauvegardé !
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Sauvegarder les modifications
            </>
          )}
        </Button>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-border">
        {["branding", "typography", "content"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "branding" && "Branding"}
            {tab === "typography" && "Typographie"}
            {tab === "content" && "Contenu"}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div>
        {/* Onglet Branding - Logo et Couleurs */}
        {activeTab === "branding" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Logo
              </h3>
              <div className="space-y-4">
                {/* Composant d'upload de logo avec ImageKit */}
                <LogoUpload
                  currentLogoUrl={settings.logoUrl}
                  onUploadComplete={(url) => {
                    // Mettre à jour le state avec l'URL retournée par ImageKit
                    handleChange("logoUrl", url)
                    // Sauvegarder automatiquement après l'upload
                    setTimeout(() => {
                      handleSaveAfterUpload(url)
                    }, 500)
                  }}
                  onRemove={() => {
                    handleChange("logoUrl", "")
                    handleSaveAfterUpload("")
                  }}
                />
                
                {/* Champ pour texte alternatif */}
                <div>
                  <label className="text-sm font-medium block mb-2">Texte alternatif (Alt)</label>
                  <Input
                    type="text"
                    placeholder="OMA Logo"
                    value={settings.logoAlt}
                    onChange={(e) => handleChange("logoAlt", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Texte descriptif du logo pour l'accessibilité
                  </p>
                </div>

                {/* Affichage de l'URL actuelle (en lecture seule) */}
                {settings.logoUrl && (
                  <div>
                    <label className="text-sm font-medium block mb-2">URL du logo (ImageKit)</label>
                    <Input
                      type="text"
                      value={settings.logoUrl}
                      readOnly
                      className="font-mono text-xs bg-muted"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      URL stockée dans ImageKit. Cliquez pour sélectionner et copier.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Photo de couverture (Bannière) */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Photo de couverture (Bannière)
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Photo de couverture affichée sur la page d'accueil (style YouTube). Recommandé : 1920x600px minimum.
              </p>
              <div className="space-y-4">
                <LogoUpload
                  currentLogoUrl={settings.coverImageUrl || ""}
                  onUploadComplete={(url) => {
                    handleChange("coverImageUrl", url)
                    setTimeout(() => {
                      handleSaveAfterUpload(url, "coverImageUrl")
                    }, 500)
                  }}
                  onRemove={() => {
                    handleChange("coverImageUrl", null)
                    handleSaveAfterUpload(null, "coverImageUrl")
                  }}
                  folder="/banners"
                />
                
                {settings.coverImageUrl && (
                  <div>
                    <label className="text-sm font-medium block mb-2">URL de la photo de couverture</label>
                    <Input
                      type="text"
                      value={settings.coverImageUrl}
                      readOnly
                      className="font-mono text-xs bg-muted"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Couleurs */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Couleurs
              </h3>
              <div className="space-y-4">
                {[
                  { key: "primaryColor", label: "Couleur primaire (noir)" },
                  { key: "secondaryColor", label: "Couleur secondaire (or)" },
                  { key: "accentColor", label: "Couleur accent (blanc)" },
                ].map((color) => (
                  <div key={color.key} className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings[color.key as keyof SiteSettings] as string}
                      onChange={(e) => handleChange(color.key as keyof SiteSettings, e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                    <label className="text-sm">{color.label}</label>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Onglet Typographie */}
        {activeTab === "typography" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Type className="w-5 h-5" />
                Polices
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Police des titres</label>
                  <Input
                    value={settings.headingFont}
                    onChange={(e) => handleChange("headingFont", e.target.value)}
                    placeholder="Ex: Playfair Display"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Police du corps</label>
                  <Input
                    value={settings.bodyFont}
                    onChange={(e) => handleChange("bodyFont", e.target.value)}
                    placeholder="Ex: Poppins"
                  />
                </div>
              </div>
            </Card>

            {/* Aperçu */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Aperçu</h3>
              <div className="space-y-4">
                <div style={{ fontFamily: settings.headingFont }}>
                  <p className="text-2xl font-bold">Ceci est un titre</p>
                </div>
                <div style={{ fontFamily: settings.bodyFont }}>
                  <p className="text-base">Ceci est du texte normal du site</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Onglet Contenu */}
        {activeTab === "content" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Section Hero</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Titre principal</label>
                  <Input value={settings.heroTitle} onChange={(e) => handleChange("heroTitle", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Sous-titre</label>
                  <textarea
                    value={settings.heroSubtitle}
                    onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Image de fond Hero
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Image de fond pour la section hero. Si non définie, l'image par défaut sera utilisée.
                  </p>
                  <LogoUpload
                    currentLogoUrl={settings.heroImageUrl || ""}
                    onUploadComplete={(url) => {
                      handleChange("heroImageUrl", url)
                      setTimeout(() => {
                        handleSaveAfterUpload(url, "heroImageUrl")
                      }, 500)
                    }}
                    onRemove={() => {
                      handleChange("heroImageUrl", null)
                      handleSaveAfterUpload(null, "heroImageUrl")
                    }}
                    folder="/hero"
                  />
                  {settings.heroImageUrl && (
                    <div className="mt-2">
                      <label className="text-sm font-medium block mb-2">URL de l'image hero</label>
                      <Input
                        type="text"
                        value={settings.heroImageUrl}
                        readOnly
                        className="font-mono text-xs bg-muted"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Section À propos</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Titre</label>
                  <Input value={settings.aboutTitle} onChange={(e) => handleChange("aboutTitle", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Description</label>
                  <textarea
                    value={settings.aboutDescription}
                    onChange={(e) => handleChange("aboutDescription", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
