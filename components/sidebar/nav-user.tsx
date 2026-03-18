"use client"

import { useEffect } from "react"
import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/stores/user-store"
import { useBusiness } from "@/components/providers/business-context"

export function NavUser({
    user: initialUser,
}: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) {
    const supabase = createBrowserSupabaseClient()
    const router = useRouter()
    const { user, supabaseUser, isLoading, fetchUser } = useUserStore()
    const business = useBusiness()

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    const userData = {
        name: user?.pushname || user?.username || supabaseUser?.user_metadata?.display_name || supabaseUser?.email?.split("@")[0] || initialUser.name,
        email: supabaseUser?.email || initialUser.email,
        avatar: user?.avatar_url || supabaseUser?.user_metadata?.avatar_url || initialUser.avatar,
    }

    const businessName = business?.name || null

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }
    const { isMobile } = useSidebar()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="sm"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-4 w-4">
                                <AvatarImage src={business?.business_logo_url || userData.avatar} alt={userData.name} />
                                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{businessName || userData.name}</span>
                                <span className="truncate text-xs">{businessName ? userData.name : userData.email}</span>
                            </div>
                            <ChevronsUpDown className="" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={business?.business_logo_url || userData.avatar} alt={userData.name} />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{businessName || userData.name}</span>
                                    <span className="truncate text-xs">{businessName ? userData.name : userData.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles />
                                Upgrade to Pro
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => { window.location.search = '?settings=true&section=account' }}>
                                <BadgeCheck />
                                Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { window.location.search = '?settings=true&section=billing' }}>
                                <CreditCard />
                                Suscripciones
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
