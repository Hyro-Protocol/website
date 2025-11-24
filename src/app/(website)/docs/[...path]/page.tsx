import { readFile } from 'fs/promises';
import { join } from 'path';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { CodeBlock } from './CodeBlock.client';
import { DocsNavigation } from './DocsNavigation';
import { getDocsTree } from './getDocsTree';

function getFilePath(pathArray: string[]): string {
  return pathArray.length === 0 
    ? join(process.cwd(), 'src', 'docs', 'index.md')
    : join(process.cwd(), 'src', 'docs', ...pathArray) + '.md';
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : 'Documentation';
}

function extractHeadings(content: string): Array<{ id: string; text: string; level: number }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ id: string; text: string; level: number }> = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    headings.push({ id, text, level });
  }

  return headings;
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path: pathArray } = await params;
  const filePath = getFilePath(pathArray);

  let content: string;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch (error) {
    notFound();
  }

  const headings = extractHeadings(content);
  const docsTree = await getDocsTree();

  return (
    <article className="pt-16 pb-24">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex gap-8">
          <DocsNavigation 
            pages={docsTree} 
            currentPath={pathArray}
            headings={headings}
          />
          <div className="flex-1 min-w-0 max-w-4xl">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSlug]}
                components={{
                  h1: ({ children, ...props }: any) => (
                    <h1 className="scroll-mt-24" {...props}>{children}</h1>
                  ),
                  h2: ({ children, ...props }: any) => (
                    <h2 className="scroll-mt-24" {...props}>{children}</h2>
                  ),
                  h3: ({ children, ...props }: any) => (
                    <h3 className="scroll-mt-24" {...props}>{children}</h3>
                  ),
                  h4: ({ children, ...props }: any) => (
                    <h4 className="scroll-mt-24" {...props}>{children}</h4>
                  ),
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    
                    return !inline && language ? (
                      <CodeBlock code={String(children).replace(/\n$/, '')} language={language} />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] }>;
}): Promise<Metadata> {
  const { path: pathArray } = await params;
  const filePath = getFilePath(pathArray);

  let content: string;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch (error) {
    return {
      title: 'Documentation - Not Found',
    };
  }

  const title = extractTitle(content);
  const pageTitle = pathArray.length === 0 ? title : `${title} - Documentation`;

  return {
    title: pageTitle,
    description: content.split('\n').find(line => line.trim() && !line.startsWith('#')) || 'Documentation',
  };
}
