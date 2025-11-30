import Link from "next/link";

export function Footer() {
    return (
        <footer className="py-10 border-t bg-muted/30">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="font-semibold mb-4">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Integrations</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">About</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">Documentation</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Community</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t">
                    <p className="text-sm text-muted-foreground">© 2024 Nenichat. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                    </div>
                </div>
            </div>
        </footer>
    )
}