import BlogCards from '@/components/BlogCards'
import Navbar from '@/components/Navbar'
import pool from '@/lib/db'

// ✅ Dynamic Metadata: Generates keywords from your actual Post Titles
export async function generateMetadata() {
  // 1. Core keywords that define your brand (Always keep these)
  const baseKeywords = [
    'Kode$word',
    'Krishna Shrivastava',
    'Developer Portfolio',
    'Web Development Projects',
    'Coding Tutorials'
  ];

  let dynamicKeywords = [];
  
  try {
    // 2. Fetch the last 10 Post Titles & Subtitles to use as keywords
    // This allows Google to see "Maximum Subarray" or "Spring Boot" as keywords automatically
    const result = await pool.query(`
      SELECT title, subtitle 
      FROM posts 
      WHERE public = true 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    // 3. Extract titles and valid subtitles into a list
    const postKeywords = result.rows.flatMap(post => {
      const keywords = [post.title];
      if (post.subtitle && post.subtitle.length < 50) {
        // Only use short subtitles as keywords to avoid spamming
        keywords.push(post.subtitle);
      }
      return keywords;
    });

    // 4. Combine Base + Dynamic
    dynamicKeywords = [...baseKeywords, ...postKeywords];

  } catch (error) {
    console.error('Error fetching dynamic keywords:', error);
    dynamicKeywords = baseKeywords; 
  }

  return {
    title: 'Blog & Projects | Kode$word - Krishna Shrivastava',
    description: 'Explore the developer journey of Krishna Shrivastava. Featuring LeetCode solutions, Spring Boot projects, Next.js dev logs, and full-stack engineering insights.',
    keywords: dynamicKeywords, // <--- Keywords are now your actual post titles
    
    openGraph: {
      title: 'Blog & Projects | Kode$word',
      description: 'My journey building scalable apps, solving LeetCode problems, and mastering full-stack development.',
      type: 'website',
      url: 'https://kodesword.vercel.app/blog',
      siteName: 'Kode$word',
    },
    
    alternates: {
      canonical: 'https://kodesword.vercel.app/blog',
    },
    
    robots: {
      index: true,
      follow: true,
    },
  }
}

const page = async () => {
  // ✅ Fetch recent posts for JSON-LD (Removed 'category' from query to fix error)
  let recentPosts = []
  try {
    const result = await pool.query(`
      SELECT id, title, subtitle, created_at 
      FROM posts 
      WHERE public = true 
      ORDER BY created_at DESC 
      LIMIT 10
    `)
    recentPosts = result.rows
  } catch (error) {
    console.error('Error fetching posts for schema:', error)
  }

  // ✅ JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Blog & Projects | Kode$word",
    "description": "A collection of coding projects, LeetCode solutions, and technical articles.",
    "url": "https://kodesword.vercel.app/blog",
    "author": {
      "@type": "Person",
      "name": "Krishna Shrivastava",
      "url": "https://kodesword.vercel.app"
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": recentPosts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://kodesword.vercel.app/blog/${post.id}`,
        "name": post.title,
        "description": post.subtitle || post.title
      }))
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div>
        <Navbar />
        <main>
          <BlogCards />
        </main>
      </div>
    </>
  )
}

export default page
