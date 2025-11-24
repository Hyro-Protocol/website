import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { readFile } from 'fs/promises';

export type DocPage = {
  path: string[];
  title: string;
  children?: DocPage[];
};

export async function getDocsTree(): Promise<DocPage[]> {
  const docsDir = join(process.cwd(), 'src', 'docs');
  const pages = await scanDirectory(docsDir, []);
  
  // Add index page at the beginning if it exists
  const indexPath = join(docsDir, 'index.md');
  try {
    const content = await readFile(indexPath, 'utf-8');
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Documentation';
    return [
      {
        path: [],
        title,
      },
      ...pages,
    ];
  } catch {
    return pages;
  }
}

async function scanDirectory(dirPath: string, pathPrefix: string[]): Promise<DocPage[]> {
  const entries = await readdir(dirPath);
  const pages: DocPage[] = [];
  const directories: Array<{ name: string; fullPath: string }> = [];
  const files: Array<{ name: string; fullPath: string }> = [];

  // Separate directories and files
  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      directories.push({ name: entry, fullPath });
    } else if (entry.endsWith('.md') && entry !== 'index.md') {
      files.push({ name: entry, fullPath });
    }
  }

  // Process directories
  for (const { name: entry, fullPath } of directories) {
    const subPages = await scanDirectory(fullPath, [...pathPrefix, entry]);
    if (subPages.length > 0) {
      // Check if there's a corresponding .md file with the same name
      const correspondingMdFile = files.find(f => f.name === `${entry}.md`);
      let title = entry;
      
      if (correspondingMdFile) {
        // Use the title from the corresponding .md file
        try {
          const content = await readFile(correspondingMdFile.fullPath, 'utf-8');
          const titleMatch = content.match(/^#\s+(.+)$/m);
          if (titleMatch) {
            title = titleMatch[1];
          }
        } catch {
          // Fallback to directory name
        }
      } else {
        // Check for index.md in the directory
        const indexPath = join(fullPath, 'index.md');
        try {
          const content = await readFile(indexPath, 'utf-8');
          const titleMatch = content.match(/^#\s+(.+)$/m);
          if (titleMatch) {
            title = titleMatch[1];
          }
        } catch {
          // No index.md, use directory name
        }
      }
      
      pages.push({
        path: [...pathPrefix, entry],
        title,
        children: subPages,
      });
    }
  }

  // Process files, but skip files that correspond to directories (they're already handled above)
  for (const { name: entry, fullPath } of files) {
    const baseName = entry.replace('.md', '');
    // Skip if this file corresponds to a directory (we already processed it above)
    if (directories.some(d => d.name === baseName)) {
      continue;
    }
    
    const content = await readFile(fullPath, 'utf-8');
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : baseName;
    const pathArray = [...pathPrefix, baseName];
    
    pages.push({
      path: pathArray,
      title,
    });
  }

  // Sort: directories first, then files, both alphabetically
  return pages.sort((a, b) => {
    if (a.children && !b.children) return -1;
    if (!a.children && b.children) return 1;
    return a.title.localeCompare(b.title);
  });
}

