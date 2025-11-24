import DocsPage from "./[...path]/page";

export default function DocsIndexPage() {
  return <>
    <DocsPage params={Promise.resolve({ path: [] })} />
  </>;
}