import Content from "@/components/layout/content"

export const metadata = {
  title: 'Plantillas',
}

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Content className="p-4 scroll-auto overflow-y-auto">{children}</Content>
  )
}
