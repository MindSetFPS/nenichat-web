import { Separator } from "./separator";
import { SidebarTrigger } from "./sidebar";

export function PageHeader({ content }: { content: React.ReactNode }) {
    return (
        <div className="flex items-center border-b pb-2">
            <SidebarTrigger className="size-auto mr-2" />
            <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
            <div className="ml-2 w-full">{content}</div>
        </div>
    )
}