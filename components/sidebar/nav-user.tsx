"use client"

import { useEffect, useState } from "react"
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

export function NavUser({
    user,
}: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) {
    const supabase = createBrowserSupabaseClient()
    const router = useRouter()
    const [userData, setUserData] = useState(user)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Get the current authenticated user from Supabase Auth
                const {
                    data: { user: authUser },
                    error: authError,
                } = await supabase.auth.getUser()

                if (authError || !authUser) {
                    console.error("Failed to fetch authenticated user:", authError)
                    setIsLoading(false)
                    return
                }

                // Get user profile data from the database
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("full_name, avatar_url")
                    .eq("id", authUser.id)
                    .single()

                if (profileError) {
                    console.error("Failed to fetch user profile:", profileError)
                    // Fall back to auth user data
                    setUserData({
                        name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
                        email: authUser.email || "",
                        avatar: authUser.user_metadata?.avatar_url || user.avatar,
                    })
                } else if (profile) {
                    setUserData({
                        name: profile.full_name || authUser.email?.split("@")[0] || "User",
                        email: authUser.email || "",
                        avatar: profile.avatar_url || user.avatar,
                    })
                }
            } catch (error) {
                console.error("Error fetching user data:", error)
                // Keep the initial user data on error
            } finally {
                setIsLoading(false)
            }
        }

        fetchUserData()
    }, [supabase, user])

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
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={userData.avatar} alt={userData.name} />
                                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{userData.name}</span>
                                <span className="truncate text-xs">{userData.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
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
                                    <AvatarImage src={userData.avatar} alt={userData.name} />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{userData.name}</span>
                                    <span className="truncate text-xs">{userData.email}</span>
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
                            <DropdownMenuItem onClick={() => router.push('/profile')}>
                                <BadgeCheck />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/settings/subscriptions')}>
                                <CreditCard />
                                Billing
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
