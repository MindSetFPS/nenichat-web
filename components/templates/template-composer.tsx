"use client"

import { useState, useRef, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { VariableIcon } from "lucide-react"
import { useProductStore } from "@/stores/product-store"
import { renderTemplate } from "@/Nenichat/Templates/app/render-template"

interface TemplateComposerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave: (name: string, message: string) => void
    initialData?: { name: string; message: string } | null
}

export function TemplateComposer({ open, onOpenChange, onSave, initialData }: TemplateComposerProps) {
    const [name, setName] = useState("")
    const [message, setMessage] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { products, fetchProducts } = useProductStore()

    useEffect(() => {
        if (open) {
            setName(initialData?.name ?? "")
            setMessage(initialData?.message ?? "")
            if (products.length === 0) fetchProducts()
        }
    }, [open, initialData])

    const preview = renderTemplate(message, { products })
    const hasVariable = message.includes("{products}")

    const handleInsertVariable = () => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const variable = "{products}"

        const newMessage = message.slice(0, start) + variable + message.slice(end)
        setMessage(newMessage)

        requestAnimationFrame(() => {
            textarea.focus()
            const cursorPos = start + variable.length
            textarea.setSelectionRange(cursorPos, cursorPos)
        })
    }

    const handleSave = () => {
        if (!name.trim() || !message.trim()) return
        onSave(name.trim(), message.trim())
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar plantilla" : "Nueva plantilla"}</DialogTitle>
                    <DialogDescription>
                        Escribe tu mensaje y usa <code className="text-xs bg-muted px-1 rounded">{`{products}`}</code> para insertar la lista de productos activos.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="template-name">Nombre</Label>
                        <Input
                            id="template-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Promoção 20% off"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 h-[300px]">
                        <div className="grid gap-2 grid-rows-[auto_1fr] min-h-0">
                            <div className="flex items-center justify-between shrink-0">
                                <Label htmlFor="template-message">Mensaje</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleInsertVariable}
                                    className="gap-1 text-xs h-7"
                                >
                                    <VariableIcon className="w-3.5 h-3.5" />{"{products}"}
                                </Button>
                            </div>
                            <Textarea
                                ref={textareaRef}
                                id="template-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Escribe tu mensaje aquí... Use {products} para inserir a lista de produtos."
                                className="resize-none"
                            />
                        </div>

                        <div className="grid gap-2 grid-rows-[auto_1fr] min-h-0">
                            <Label className="text-xs text-muted-foreground shrink-0">
                                Vista previa {hasVariable && "(productos activos)"}
                            </Label>
                            <Card className="bg-muted/40 min-h-0 overflow-y-auto">
                                <CardContent className="p-3">
                                    <p className="text-sm whitespace-pre-wrap">
                                        {message.trim() ? (hasVariable ? preview : message) : "Escribe algo para ver la vista previa..."}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={!name.trim() || !message.trim()}>
                            Guardar plantilla
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
