import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Post } from "@/payload-types";
import { Calendar, ClockIcon } from "lucide-react";
import { Media } from "@/components/Media";
import Link from "next/link";
import { calculateReadingTime } from "@/utilities/calculateReadingTime";
import { formatBlogDate } from "@/utilities/formatBlogDate";

type CategoryWithCount = {
  id: number;
  title: string;
  slug: string;
  totalPosts: number;
};

const Blog = ({ posts, categories }: { posts: Post[]; categories: CategoryWithCount[] }) => {
  return (
    <div className="max-w-7xl mx-auto py-10 lg:py-16 px-6 flex flex-col lg:flex-row items-stretch gap-12">
      <div className="w-full">
        <div className="space-y-12">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="gap-0 flex flex-col sm:flex-row sm:items-center shadow-none overflow-hidden rounded-md border-none py-0 w-full"
            >
              <Media
                resource={post.meta?.image}
                className="relative shrink-0 aspect-video grow sm:w-56 sm:aspect-square bg-muted rounded-lg object-cover"
                size="256px"
                fill
                imgClassName="object-cover"
              />
              <CardContent className="p-4 sm:p-6 flex flex-col self-stretch">
                {post.categories && Array.isArray(post.categories) && post.categories.length > 0 && (
                  <div className="flex items-center gap-6 mb-auto">
                    {(() => {
                      const firstCategory = post.categories[0]
                      const categoryTitle = typeof firstCategory === 'object' 
                        ? firstCategory.title 
                        : categories.find(c => c.id === firstCategory)?.title || 'Uncategorized'
                      return (
                        <Badge className="bg-primary/5 text-primary hover:bg-primary/5 shadow-none">
                          {categoryTitle}
                        </Badge>
                      )
                    })()}
                  </div>
                )}

                <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                  <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="mt-2 text-muted-foreground line-clamp-3 text-ellipsis mb-4">
                  {post.meta?.description}
                </p>
                <div className="flex items-center gap-6 text-muted-foreground text-sm font-medium mt-auto">
                  {post.content && (
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" /> {calculateReadingTime(post.content)} min read
                    </div>
                  )}
                  {post.publishedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> {formatBlogDate(post.publishedAt)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {categories.length > 0 && (
        <aside className="sticky top-8 shrink-0 lg:max-w-sm w-full">
          <h3 className="text-xl font-semibold tracking-tight">Categories</h3>
          <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-2">
            {categories
              .filter((category) => category.totalPosts > 0)
              .map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-2 bg-muted p-3 rounded-md bg-opacity-15 dark:bg-opacity-25"
                >
                  <span className="font-medium">{category.title}</span>
                  <Badge className="px-1.5 rounded-full bg-foreground/7 text-foreground">
                    {category.totalPosts}
                  </Badge>
                </div>
              ))}
          </div>
        </aside>
      )}
    </div>
  );
};

export default Blog;
