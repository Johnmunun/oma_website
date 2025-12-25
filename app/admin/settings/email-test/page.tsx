"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Mail, CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function EmailTestPage() {
  const [testEmail, setTestEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    details?: any
  } | null>(null)
  const [config, setConfig] = useState<any>(null)
  const [loadingConfig, setLoadingConfig] = useState(true)

  // Charger la configuration SMTP
  const loadConfig = async () => {
    try {
      setLoadingConfig(true)
      const res = await fetch('/api/admin/test-smtp')
      if (!res.ok) throw new Error('Erreur chargement config')
      const data = await res.json()
      if (data.success) {
        setConfig(data)
        setTestResult({
          type: data.connectionTest.success ? 'success' : 'error',
          message: data.connectionTest.message,
        })
      }
    } catch (err: any) {
      console.error('[EmailTest] Erreur:', err)
      toast.error('Erreur lors du chargement de la configuration')
    } finally {
      setLoadingConfig(false)
    }
  }

  // Tester l'envoi d'email
  const testEmailSend = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Veuillez entrer un email valide')
      return
    }

    try {
      setLoading(true)
      setTestResult(null)
      
      const res = await fetch('/api/admin/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      })

      const data = await res.json()

      if (data.success) {
        setTestResult({
          type: 'success',
          message: data.message || 'Email de test envoyé avec succès !',
        })
        toast.success('Email de test envoyé !')
      } else {
        setTestResult({
          type: 'error',
          message: data.error || 'Erreur lors de l\'envoi',
          details: data.details,
        })
        toast.error('Erreur lors de l\'envoi de l\'email')
      }
    } catch (err: any) {
      console.error('[EmailTest] Erreur:', err)
      setTestResult({
        type: 'error',
        message: err.message || 'Erreur inconnue',
      })
      toast.error('Erreur lors du test')
    } finally {
      setLoading(false)
    }
  }

  // Charger la config au montage
  useEffect(() => {
    loadConfig()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test Email SMTP</h1>
        <p className="text-muted-foreground mt-2">
          Testez la configuration SMTP et envoyez un email de test
        </p>
      </div>

      {/* Configuration actuelle */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration SMTP actuelle</CardTitle>
          <CardDescription>
            Configuration chargée depuis la base de données
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingConfig ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Chargement de la configuration...</span>
            </div>
          ) : config ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Serveur SMTP</label>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{config.config.host}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Port</label>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{config.config.port}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Connexion sécurisée</label>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{config.config.secure ? 'Oui (SSL)' : 'Non (TLS)'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email SMTP</label>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{config.config.user || 'NON CONFIGURÉ'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mot de passe</label>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{config.config.pass ? '***' : 'NON CONFIGURÉ'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email de contact</label>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{config.contactEmail || 'NON CONFIGURÉ'}</p>
                </div>
              </div>

              {/* Test de connexion */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2">
                  {config.connectionTest.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">Test de connexion SMTP</span>
                </div>
                <p className={`text-sm mt-1 ${config.connectionTest.success ? 'text-green-600' : 'text-red-600'}`}>
                  {config.connectionTest.message}
                </p>
              </div>

              <Button onClick={loadConfig} variant="outline" size="sm">
                Actualiser la configuration
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Impossible de charger la configuration</p>
          )}
        </CardContent>
      </Card>

      {/* Test d'envoi */}
      <Card>
        <CardHeader>
          <CardTitle>Envoyer un email de test</CardTitle>
          <CardDescription>
            Envoyez un email de test pour vérifier que l'envoi fonctionne correctement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Email de destination
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="votre-email@exemple.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={testEmailSend} disabled={loading || !testEmail}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-lg border ${
                testResult.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : testResult.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-start gap-2">
                {testResult.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : testResult.type === 'error' ? (
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : null}
                <div className="flex-1">
                  <p className="font-medium">{testResult.message}</p>
                  {testResult.details && (
                    <pre className="mt-2 text-xs bg-white/50 p-2 rounded overflow-auto">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Vérifiez que tous les paramètres SMTP sont correctement configurés dans <code className="bg-muted px-1 rounded">/admin/settings</code></p>
          <p>2. Pour Gmail, utilisez un "App Password" (pas votre mot de passe normal)</p>
          <p>3. Vérifiez que l'email de contact est configuré dans les paramètres</p>
          <p>4. Si le test de connexion échoue, vérifiez les logs dans la console du serveur</p>
        </CardContent>
      </Card>
    </div>
  )
}

