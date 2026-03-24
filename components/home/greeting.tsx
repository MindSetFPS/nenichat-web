export default function Greeting({ user, business }: { user: any, business: any }) {
    return (
        < div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4" >
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
                    Buenos días, {user.email?.split('@')[0]} 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                    Aquí está lo que está pasando en {business.name} hoy.
                </p>
            </div>
            <div className="flex gap-2">
                {/* Quick Stats or Actions could go here */}
            </div>
        </div >

    )
}