import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon, Bot } from 'lucide-react'

import { Separator } from '@/components/ui/separator'

import TiktokIcon from '@/components/marketing/social-media-icons/tiktok'
import Image from 'next/image'

const Footer = () => {
    return (
        <footer>
            <div className='mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8'>
                <a href='#'>
                    <div className='flex items-center gap-3'>
                        <Image src='/icon.svg' alt='logo' width={32} height={32} />
                    </div>
                </a>

                <div className='flex items-center gap-5 whitespace-nowrap'>
                    <a href='#'>About</a>
                    <a href='#ecommerce-capabilities'>Features</a>
                    <a href='#'>Career</a>
                </div>

                <div className='flex items-center gap-4'>
                    <a href='https://www.facebook.com/nenichat'>
                        <FacebookIcon className='size-5' />
                    </a>
                    <a href='https://www.instagram.com/nenichat'>
                        <InstagramIcon className='size-5' />
                    </a>
                    <a href='https://www.tiktok.com/@nenichat'>
                        <TiktokIcon className='size-5' />
                    </a>
                </div>
            </div>

            <Separator />

            <div className='mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6'>
                <p className='text-center font-medium text-balance'>
                    {`©${new Date().getFullYear()}`} <a href='#'>NeniChat</a>, Made with ❤️ for better web.
                </p>
            </div>
        </footer>
    )
}

export default Footer