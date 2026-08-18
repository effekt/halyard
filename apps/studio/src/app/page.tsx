import { fixtureRoutes } from "demo/fixtures/fixtureRoutes";
import { catalog } from "demo/src/nubbin/catalog";
import { BlockFields } from "../components/BlockFields";
import { prefixedRoute } from "../nubbin/prefixedRoute";

/** Everything on this page is derived: routes from the demo's fixtures, blocks and fields
 * from its catalog's schemas. */
export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 text-marine">
      <h1 className="font-semibold text-3xl">Nubbin studio</h1>
      <section aria-labelledby="drafts-heading" className="mt-8">
        <h2 id="drafts-heading" className="font-semibold text-xl">
          Drafts
        </h2>
        <ul className="mt-3 list-disc pl-6">
          {Object.keys(fixtureRoutes).map((route) => (
            <li key={route} className="py-0.5">
              <a
                className="text-teal underline underline-offset-4"
                href={prefixedRoute("/preview", route)}
              >
                {route}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="blocks-heading" className="mt-10">
        <h2 id="blocks-heading" className="font-semibold text-xl">
          Blocks
        </h2>
        <div className="mt-3 flex flex-col gap-4">
          {Object.entries(catalog).map(([name, entry]) => (
            <BlockFields key={name} name={name} entry={entry} />
          ))}
        </div>
      </section>
    </main>
  );
}
