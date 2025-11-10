/**
 * @file app/admin/messages/page.tsx
 * @description Page admin pour voir et gérer les messages de contact
 * Affiche la liste des messages avec filtres (lus/non lus)
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageSkeleton } from "@/components/admin/page-skeleton"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { toast } from "sonner"
import {
  Mail,
  MailOpen,
  User,
  Calendar,
  Filter,
  CheckCircle2,
  Circle,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filter === "unread") params.append("isRead", "false")
      if (filter === "read") params.append("isRead", "true")

      const [messagesRes, countRes] = await Promise.all([
        fetch(`/api/admin/messages?${params.toString()}`),
        fetch("/api/admin/messages/count"),
      ])

      if (!messagesRes.ok || !countRes.ok) {
        throw new Error("Erreur lors du chargement")
      }

      const messagesData = await messagesRes.json()
      const countData = await countRes.json()

      if (messagesData.success) {
        setMessages(messagesData.data.messages)
      }
      if (countData.success) {
        setUnreadCount(countData.data.unreadCount)
        // Déclencher un événement pour mettre à jour le compteur dans le sidebar
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('message-updated'))
        }
      }
    } catch (err) {
      console.error("[Admin] Erreur chargement messages:", err)
      toast.error("Impossible de charger les messages")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
    // Recharger toutes les 30 secondes pour le compteur en temps réel
    const interval = setInterval(() => {
      fetch("/api/admin/messages/count")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUnreadCount(data.data.unreadCount)
          }
        })
        .catch(console.error)
    }, 30000)

    return () => clearInterval(interval)
  }, [filter])

  const markAsRead = async (messageId: string, isRead: boolean) => {
    try {
      const res = await fetch(`/api/admin/messages?id=${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !isRead }),
      })

      if (!res.ok) throw new Error("Erreur lors de la mise à jour")

      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        loadMessages()
        // Déclencher un événement pour mettre à jour le compteur dans le sidebar
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('message-updated'))
        }
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(data.data)
        }
      }
    } catch (err: any) {
      console.error("[Admin] Erreur mise à jour message:", err)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  if (isLoading) {
    return <PageSkeleton type="table" showHeader={true} showFilters={true} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Messages de contact"
        description="Gérez les messages reçus depuis le formulaire de contact"
        action={{
          label: "Actualiser",
          onClick: loadMessages,
          icon: <RefreshCw className="w-4 h-4" />,
        }}
      />

      {/* Filtres */}
      <Card className="border-0 shadow-soft bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              Tous ({messages.length})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
            >
              Non lus ({unreadCount})
            </Button>
            <Button
              variant={filter === "read" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("read")}
            >
              Lus ({messages.length - unreadCount})
            </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des messages */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Liste */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card className="p-8 text-center border-0 shadow-soft bg-white">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun message</p>
            </Card>
          ) : (
            messages.map((message) => (
              <Card
                key={message.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-soft-lg border-0 shadow-soft bg-white ${
                  selectedMessage?.id === message.id
                    ? "ring-2 ring-primary"
                    : message.isRead
                    ? ""
                    : "ring-2 ring-primary/30 bg-primary/5"
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {!message.isRead && (
                        <Badge variant="default" className="gradient-purple text-white">
                          Nouveau
                        </Badge>
                      )}
                      <h3 className="font-semibold text-sm truncate">
                        {message.subject || `Message de ${message.name}`}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {message.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(message.createdAt), "dd MMM yyyy à HH:mm", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {message.message}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {message.isRead ? (
                      <MailOpen className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Mail className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Détails du message sélectionné */}
        <div>
          {selectedMessage ? (
            <Card className="p-6 sticky top-4 border-0 shadow-soft-lg bg-white">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2">
                      {selectedMessage.subject || `Message de ${selectedMessage.name}`}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {selectedMessage.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="hover:text-primary transition-colors"
                        >
                          {selectedMessage.email}
                        </a>
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Reçu le{" "}
                        {format(new Date(selectedMessage.createdAt), "dd MMMM yyyy à HH:mm", {
                          locale: fr,
                        })}
                      </span>
                      {selectedMessage.readAt && (
                        <span className="flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Lu le{" "}
                          {format(new Date(selectedMessage.readAt), "dd MMMM yyyy à HH:mm", {
                            locale: fr,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  {!selectedMessage.isRead && (
                    <Badge variant="default" className="bg-primary">
                      Nouveau
                    </Badge>
                  )}
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold mb-2">Message :</h3>
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant={selectedMessage.isRead ? "outline" : "default"}
                    size="sm"
                    onClick={() => markAsRead(selectedMessage.id, selectedMessage.isRead)}
                    className="flex-1"
                  >
                    {selectedMessage.isRead ? (
                      <>
                        <Circle className="w-4 h-4 mr-2" />
                        Marquer non lu
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Marquer lu
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      (window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || "Votre message"}`)
                    }
                    className="flex-1"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Répondre
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Sélectionnez un message pour voir les détails</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

