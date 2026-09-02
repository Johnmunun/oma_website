'use client'

import type React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import type {
  AgeFieldConfig,
  ChallengeRegistrationSettings,
  CityFieldConfig,
  RegistrationFieldConfig,
} from '@/lib/challenges/challenge-registration-settings'

interface ChallengeRegistrationSettingsEditorProps {
  value: ChallengeRegistrationSettings
  onChange: (value: ChallengeRegistrationSettings) => void
}

function FieldRow({
  label,
  description,
  config,
  onChange,
  children,
}: {
  label: string
  description?: string
  config: RegistrationFieldConfig
  onChange: (config: RegistrationFieldConfig) => void
  children?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border/80 bg-muted/30 p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <label className="flex items-center gap-2 text-xs">
            <Checkbox
              checked={config.enabled}
              onCheckedChange={(checked) =>
                onChange({ ...config, enabled: checked === true })
              }
            />
            Afficher
          </label>
          <label className="flex items-center gap-2 text-xs">
            <Checkbox
              checked={config.required}
              disabled={!config.enabled}
              onCheckedChange={(checked) =>
                onChange({ ...config, required: checked === true })
              }
            />
            Obligatoire
          </label>
        </div>
      </div>
      {config.enabled && children}
    </div>
  )
}

export function ChallengeRegistrationSettingsEditor({
  value,
  onChange,
}: ChallengeRegistrationSettingsEditorProps) {
  const patch = (partial: Partial<ChallengeRegistrationSettings>) => {
    onChange({ ...value, ...partial })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Critères d&apos;inscription</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Configurez les champs et contraintes du formulaire public. Nom et email du candidat
          restent toujours obligatoires.
        </p>
      </div>

      <FieldRow
        label="Âge"
        description="Sans min/max, tout âge valide (1–120) est accepté."
        config={value.age}
        onChange={(age) => patch({ age: age as AgeFieldConfig })}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Âge minimum</Label>
            <Input
              type="number"
              min={1}
              max={120}
              placeholder="Aucun"
              value={value.age.min ?? ''}
              onChange={(e) => {
                const raw = e.target.value
                const parsed = raw ? Number.parseInt(raw, 10) : null
                patch({
                  age: {
                    ...value.age,
                    min: parsed != null && Number.isFinite(parsed) ? parsed : null,
                  },
                })
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Âge maximum</Label>
            <Input
              type="number"
              min={1}
              max={120}
              placeholder="Aucun"
              value={value.age.max ?? ''}
              onChange={(e) => {
                const raw = e.target.value
                const parsed = raw ? Number.parseInt(raw, 10) : null
                patch({
                  age: {
                    ...value.age,
                    max: parsed != null && Number.isFinite(parsed) ? parsed : null,
                  },
                })
              }}
            />
          </div>
        </div>
      </FieldRow>

      <FieldRow
        label="Téléphone"
        config={value.phone}
        onChange={(phone) => patch({ phone })}
      />

      <FieldRow
        label="Ville"
        description="Laissez la liste vide pour accepter toutes les villes."
        config={value.city}
        onChange={(city) => patch({ city: city as CityFieldConfig })}
      >
        <div className="space-y-1">
          <Label className="text-xs">Villes autorisées (une par ligne)</Label>
          <Textarea
            rows={3}
            placeholder={'Abidjan\nBouaké\nYamoussoukro'}
            value={(value.city.allowedCities ?? []).join('\n')}
            onChange={(e) =>
              patch({
                city: {
                  ...value.city,
                  allowedCities: e.target.value
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean),
                },
              })
            }
          />
        </div>
      </FieldRow>

      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Responsable / parent
        </p>
        <FieldRow
          label="Nom du responsable"
          config={value.parentName}
          onChange={(parentName) => patch({ parentName })}
        />
        <FieldRow
          label="Email du responsable"
          config={value.parentEmail}
          onChange={(parentEmail) => patch({ parentEmail })}
        />
        <FieldRow
          label="Téléphone du responsable"
          config={value.parentPhone}
          onChange={(parentPhone) => patch({ parentPhone })}
        />
      </div>

      <FieldRow
        label="Motivation / talent"
        config={value.notes}
        onChange={(notes) => patch({ notes })}
      />
    </div>
  )
}
