import { Separator } from "./separator";
import { SidebarTrigger } from "./sidebar";

export function PageHeader({ content }: { content: React.ReactNode }) {
    return (
        <div className="flex items-center border-b mb-0 -mx-2 md:-mx-4 mt-0 md:-mt-2 p-2">
            <SidebarTrigger className="size-auto mr-2" />
            <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
            <div className="ml-2 w-full">{content}</div>
        </div>
    )
}