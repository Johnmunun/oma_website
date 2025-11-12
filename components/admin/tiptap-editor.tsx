"use client"

/**
 * @file components/admin/tiptap-editor.tsx
 * @description Éditeur de texte riche Tiptap pour la description des événements
 */

import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Code,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TiptapEditorProps {
  content: string | null
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = "Commencez à écrire...",
  className,
}: TiptapEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  // S'assurer que le composant est monté côté client avant d'initialiser l'éditeur
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    immediatelyRender: false, // Éviter les problèmes d'hydratation SSR
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] max-w-none px-4 py-3',
      },
    },
  })

  // Ne pas rendre l'éditeur pendant le SSR
  if (!isMounted || !editor) {
    return (
      <div className={cn("border border-border rounded-lg overflow-hidden", className)}>
        <div className="border-b border-border bg-muted/50 p-2 flex flex-wrap items-center gap-1">
          <div className="h-8 w-full bg-muted animate-pulse rounded" />
        </div>
        <div className="bg-background min-h-[200px] p-4">
          <div className="h-4 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="border-b border-border bg-muted/50 p-2 flex flex-wrap items-center gap-1">
        {/* Format de texte */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('bold') && "bg-muted"
            )}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('italic') && "bg-muted"
            )}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('strike') && "bg-muted"
            )}
          >
            <Strikethrough className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('code') && "bg-muted"
            )}
          >
            <Code className="w-4 h-4" />
          </Button>
        </div>

        {/* Titres */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('heading', { level: 1 }) && "bg-muted"
            )}
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('heading', { level: 2 }) && "bg-muted"
            )}
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('heading', { level: 3 }) && "bg-muted"
            )}
          >
            <Heading3 className="w-4 h-4" />
          </Button>
        </div>

        {/* Listes */}
        <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('bulletList') && "bg-muted"
            )}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('orderedList') && "bg-muted"
            )}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('blockquote') && "bg-muted"
            )}
          >
            <Quote className="w-4 h-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Éditeur */}
      <div className="bg-background">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: 200px;
          padding: 16px;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.67em;
          margin-bottom: 0.67em;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.83em;
          margin-bottom: 0.83em;
        }
        .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 1em;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5em;
          margin: 1em 0;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
        }
        .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.9em;
        }
        .ProseMirror strong {
          font-weight: bold;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror p {
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  )
}

