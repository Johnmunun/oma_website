'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface CandidateRejectDialogProps {
  open: boolean
  candidateName?: string
  isSubmitting?: boolean
  onClose: () => void
  onConfirm: (reviewNotes: string) => Promise<void>
}

export function CandidateRejectDialog({
  open,
  candidateName,
  isSubmitting = false,
  onClose,
  onConfirm,
}: CandidateRejectDialogProps) {
  const [reviewNotes, setReviewNotes] = useState('')

  const handleClose = () => {
    if (isSubmitting) return
    setReviewNotes('')
    onClose()
  }

  const handleConfirm = async () => {
    await onConfirm(reviewNotes.trim())
    setReviewNotes('')
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rejeter la candidature</DialogTitle>
          <DialogDescription>
            {candidateName
              ? `Confirmer le rejet de « ${candidateName} ». Un email sera envoyé au candidat.`
              : 'Confirmer le rejet de cette candidature. Un email sera envoyé au candidat.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="reject-review-notes">Message au candidat (optionnel)</Label>
          <Textarea
            id="reject-review-notes"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Ex. Merci pour votre candidature. Cette édition est réservée aux 6-12 ans…"
            rows={4}
            className="resize-none"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleConfirm()}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Envoi…' : 'Confirmer le rejet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
