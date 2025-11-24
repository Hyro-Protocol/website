'use client'
import Link from 'next/link';
import { DocPage } from './getDocsTree';

type Heading = {
  id: string;
  text: string;
  level: number;
};

type DocsNavigationProps = {
  pages: DocPage[];
  currentPath: string[];
  headings?: Heading[];
};

export function DocsNavigation({ pages, currentPath, headings = [] }: DocsNavigationProps) {
  const currentPathStr = currentPath.join('/');

  const isActive = (pagePath: string[]) => {
    const pagePathStr = pagePath.join('/');
    return pagePathStr === currentPathStr;
  };

  const renderPage = (page: DocPage, depth: number = 0) => {
    const pagePath = page.path.length === 0 ? '/docs' : `/docs/${page.path.join('/')}`;
    const active = isActive(page.path);
    const hasActiveChild = page.children?.some((child) => 
      isActive(child.path) || child.children?.some((grandchild) => isActive(grandchild.path))
    );

    return (
      <li key={pagePath} className={depth > 0 ? 'ml-4' : ''}>
        <Link
          href={pagePath}
          className={`
            block py-1.5 px-2 rounded-md text-sm transition-colors
            ${active 
              ? 'bg-primary/10 text-primary font-medium' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }
          `}
        >
          {page.title}
        </Link>
        {(active || hasActiveChild) && page.children && (
          <ul className="mt-1 space-y-0.5">
            {page.children.map((child) => renderPage(child, depth + 1))}
          </ul>
        )}
        {active && headings.length > 0 && (
          <ul className="mt-2 ml-4 space-y-1 border-l border-border pl-4">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`${pagePath}#${heading.id}`}
                  className={`
                    block py-1 text-xs transition-colors
                    ${heading.level === 1 ? 'pl-0 font-medium' : heading.level === 2 ? 'pl-2' : 'pl-4'}
                    text-muted-foreground hover:text-foreground
                  `}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav className="sticky top-24 w-64 shrink-0 h-fit hidden lg:block">
      <div className="pr-6">
        <h2 className="text-sm font-semibold text-foreground mb-4 px-2">Documentation</h2>
        <ul className="space-y-1">
          {pages.map((page) => renderPage(page))}
        </ul>
      </div>
    </nav>
  );
}

