import type { Metadata } from 'next/types'

import Blog from '@/components/blog'
import { BlogPagination } from '@/components/blog-pagination'
import configPromise from '@/payload-config'
import { Post } from '@/payload-types'
import { getPayload } from 'payload'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const [posts, categories] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 12,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: true,
        publishedAt: true,
        content: true,
      },
    }),
    payload.find({
      collection: 'categories',
      depth: 0,
      limit: 100,
      overrideAccess: false,
    }),
  ])

  // Count posts per category
  const categoryCounts = new Map<number, number>()
  posts.docs.forEach((post) => {
    if (post.categories && Array.isArray(post.categories)) {
      post.categories.forEach((category) => {
        const categoryId = typeof category === 'object' ? category.id : category
        categoryCounts.set(categoryId, (categoryCounts.get(categoryId) || 0) + 1)
      })
    }
  })

  // Map categories with counts
  const categoriesWithCounts = categories.docs.map((category) => ({
    id: category.id,
    title: category.title,
    slug: category.slug,
    totalPosts: categoryCounts.get(category.id) || 0,
  }))

  return (
    <div className="py-8">
      <PageClient />

      <Blog posts={posts.docs as Post[]} categories={categoriesWithCounts} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <BlogPagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Posts`,
  }
}
