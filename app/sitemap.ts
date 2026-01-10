import { MetadataRoute } from 'next'

/**
 * Dynamic sitemap for SEO
 * Next.js will automatically generate sitemap.xml from this file
 */
export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://nenichat.com',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        // Add more URLs as your site grows:
        // {
        //   url: 'https://nenichat.com/about',
        //   lastModified: new Date(),
        //   changeFrequency: 'monthly',
        //   priority: 0.8,
        // },
    ]
}
