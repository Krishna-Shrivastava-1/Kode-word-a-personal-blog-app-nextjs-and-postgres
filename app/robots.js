export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/'],
      },
    ],
    sitemap: 'https://kodesword.vercel.app/sitemap.xml',
  }
}
