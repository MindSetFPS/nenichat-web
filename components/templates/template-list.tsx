"use client"

import { useState, useEffect } from "react"
import { FileText, Plus, Trash2, Eye, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyList } from "@/components/empty-list"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TemplateComposer } from "@/components/templates/template-composer"
import { useProductStore } from "@/stores/product-store"
import { renderTemplate } from "@/Nenichat/Templates/app/render-template"
import type { ITemplate } from "@/Nenichat/Templates/domain/ITemplate"

interface TemplateListProps {
  initialTemplates: ITemplate[]
}

export function TemplateList({ initialTemplates }: TemplateListProps) {
  const [templates, setTemplates] = useState<ITemplate[]>(initialTemplates)
  const { products, fetchProducts } = useProductStore()
  const [composerOpen, setComposerOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ITemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<ITemplate | null>(null)

  useEffect(() => {
    if (products.length === 0) fetchProducts()
  }, [])

  const handleNew = () => {
    setEditingTemplate(null)
    setComposerOpen(true)
  }

  const handleEdit = (template: ITemplate) => {
    setEditingTemplate(template)
    setComposerOpen(true)
  }

  const handleSave = async (name: string, message: string) => {
    try {
      const res = await fetch(editingTemplate ? `/api/templates/${editingTemplate.id}` : '/api/templates', {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const saved = await res.json()
      if (editingTemplate) {
        setTemplates((prev) => prev.map((t) => (t.id === editingTemplate.id ? saved : t)))
        setEditingTemplate(null)
      } else {
        setTemplates((prev) => [saved, ...prev])
      }
      setComposerOpen(false)
    } catch (error: any) {
      console.error("Error saving template:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch (error: any) {
      console.error("Error deleting template:", error)
    }
  }

  if (templates.length === 0) {
    return (
      <>
        <PageHeader />
        <EmptyList
          title="Sin plantillas"
          description="Crea una plantilla con variables como {products} para enviar rápido desde cualquier chat."
          action={<Button onClick={handleNew}><Plus />Nueva plantilla</Button>}
          icon={<FileText className="w-12 h-12 text-primary" strokeWidth={1.5} />}
        />
        <TemplateComposer
          open={composerOpen}
          onOpenChange={(open) => { setComposerOpen(open); if (!open) setEditingTemplate(null); }}
          onSave={handleSave}
        />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Plantillas">
        <Button onClick={handleNew}><Plus className="w-4 h-4" />Nueva plantilla</Button>
      </PageHeader>

      <div className="divide-y mt-4 rounded-lg border overflow-hidden">
        {templates.map((template) => (
          <div
            key={template.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors group"
          >
            <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 text-primary shrink-0">
              <FileText className="size-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{template.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {renderTemplate(template.message, { products }).replace(/\n/g, " · ")}
              </div>
              <div className="text-[10px] text-muted-foreground/60">
                {new Date(template.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEdit(template)} title="Editar">
                <Pencil className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8" onClick={() => setPreviewTemplate(template)} title="Vista previa">
                <Eye className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => handleDelete(template.id)} title="Eliminar">
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <TemplateComposer
        open={composerOpen}
        onOpenChange={(open) => { setComposerOpen(open); if (!open) setEditingTemplate(null); }}
        onSave={handleSave}
        initialData={editingTemplate}
      />

      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">Plantilla:</p>
                <p className="text-sm whitespace-pre-wrap">{previewTemplate.message}</p>
              </div>
              {previewTemplate.message.includes("{products}") && (
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Vista previa (productos activos):</p>
                  <p className="text-sm whitespace-pre-wrap">
                    {renderTemplate(previewTemplate.message, { products })}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
