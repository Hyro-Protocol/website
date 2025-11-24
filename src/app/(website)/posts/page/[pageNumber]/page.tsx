import type { Metadata } from 'next/types'

import Blog from '@/components/blog'
import { BlogPagination } from '@/components/blog-pagination'
import configPromise from '@/payload-config'
import { Post } from '@/payload-types'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import PageClient from './page.client'

export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const [posts, categories] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 12,
      page: sanitizedPageNumber,
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
    <div className="pt-24 pb-24">
      <PageClient />
      
      <Blog posts={posts.docs as Post[]} categories={categoriesWithCounts} />

      <div className="container">
        {posts?.page && posts?.totalPages > 1 && (
          <BlogPagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Payload Website Template Posts Page ${pageNumber || ''}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 10)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
