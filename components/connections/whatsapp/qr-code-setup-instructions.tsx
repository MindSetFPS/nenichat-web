export default function QrCodeSetupInstructions() {
    return (
        <div className="space-y-2 max-w-sm px-8">
            <h2 className="text-2xl font-bold">Escanea el código QR</h2>
            <ol className="text-sm text-muted-foreground text-left space-y-2 mt-4">
                <li className="flex gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">1</span>
                    Abre WhatsApp en tu teléfono
                </li>
                <li className="flex gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">2</span>
                    Toca Menú o Configuración y selecciona Dispositivos vinculados
                </li>
                <li className="flex gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">3</span>
                    Apunta tu teléfono a esta pantalla para escanear el código
                </li>
            </ol>
        </div>
    )
}