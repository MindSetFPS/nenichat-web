"use client"

import { useEffect } from "react"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTemplateStore } from "@/stores/template-store"
import { useProductStore } from "@/stores/product-store"
import { renderTemplate } from "@/Nenichat/Templates/app/render-template"

interface TemplateQuickAnswersProps {
  onSelectTemplate: (message: string) => void
  disabled?: boolean
}

export function TemplateQuickAnswers({ onSelectTemplate, disabled }: TemplateQuickAnswersProps) {
  const { templates, fetchTemplates } = useTemplateStore()
  const { products, fetchProducts } = useProductStore()

  useEffect(() => {
    if (templates.length === 0) fetchTemplates()
    if (products.length === 0) fetchProducts()
  }, [])

  if (templates.length === 0) return null

  const handleClick = (message: string) => {
    const rendered = renderTemplate(message, { products })
    onSelectTemplate(rendered)
  }

  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 px-1 mb-1.5">
        <FileText className="w-3 h-3 text-muted-foreground/50" />
        <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
          Plantillas
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {templates.map((template) => (
          <Button
            key={template.id}
            variant="outline"
            size="sm"
            onClick={() => handleClick(template.message)}
            className="cursor-pointer rounded-full text-xs py-1.5 h-auto bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/40 transition-all"
            disabled={disabled}
          >
            {template.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
