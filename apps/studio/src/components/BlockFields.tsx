import type { CatalogEntry } from "@nubbin/core";
import { zodAdapter } from "@nubbin/core";

interface BlockFieldsProps {
  name: string;
  entry: CatalogEntry;
}

/** One palette entry: the field rows are read from the schema itself, never authored beside it. */
export function BlockFields({ name, entry }: BlockFieldsProps) {
  const fields = zodAdapter.describe(entry.schema);
  return (
    <article className="rounded-md border border-marine/15 bg-white p-4">
      <h3 className="font-semibold text-lg text-marine">{name}</h3>
      {entry.docs?.summary === undefined ? null : <p className="mt-1">{entry.docs.summary}</p>}
      <table className="mt-3 w-full text-left text-sm">
        <thead>
          <tr className="border-marine/20 border-b">
            <th scope="col" className="py-1 pr-4">
              Path
            </th>
            <th scope="col" className="py-1 pr-4">
              Kind
            </th>
            <th scope="col" className="py-1 pr-4">
              Presence
            </th>
            <th scope="col" className="py-1">
              Values
            </th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.path} className="border-marine/10 border-b last:border-b-0">
              <th scope="row" className="py-1 pr-4 font-normal">
                <code>{field.path}</code>
              </th>
              <td className="py-1 pr-4">{field.kind}</td>
              <td className="py-1 pr-4">{field.optional ? "optional" : "required"}</td>
              <td className="py-1">
                {field.members === undefined ? "—" : field.members.join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}
