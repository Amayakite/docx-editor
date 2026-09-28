import { expect, test } from 'bun:test';
import { readOoxmlPackage, writeOoxmlPackage } from '../../store/package/ooxml-package.ts';
import { serializeOoxmlPart } from '../../store/package/ooxml-serialize.ts';
import { createFixedMeasurer } from '../fixed-measurer.ts';
import { layoutSemanticDocument } from '../semantic-layout.ts';
import { buildStyleCascadeTable } from '../style-cascade.ts';

const cases = [
  {
    file: '01-two-tables.docx',
    widths: [
      [102.05, 351.5],
      [68.05, 39.7, 39.7, 306.15],
    ],
  },
  {
    file: '02-five-columns.docx',
    widths: [[62.35, 85.05, 73.7, 226.75, 45.35]],
  },
  {
    file: '03-reviewer-control.docx',
    widths: [
      [60, 90, 210],
      [60, 90, 210],
    ],
  },
];

for (const scenario of cases) {
  test(`fixed-grid reference survives layout and save/reopen: ${scenario.file}`, async () => {
    const bytes = await Bun.file(
      new URL(`../../../../../e2e/fixtures/fixed-table-widths/${scenario.file}`, import.meta.url)
    ).bytes();
    const opened = readOoxmlPackage(bytes);
    if (!opened.ok) throw new Error(opened.reason);
    const original = opened.package;
    const snapshots = new Map(
      Array.from(original.parts, ([name, part]) => [name, serializeOoxmlPart(part)])
    );
    const reopened = readOoxmlPackage(writeOoxmlPackage(original));
    if (!reopened.ok) throw new Error(reopened.reason);

    for (const pkg of [original, reopened.package]) {
      const document = pkg.parts.get(pkg.mainDocumentPart)!;
      const styles = pkg.parts.get('/word/styles.xml');
      const layout = layoutSemanticDocument(document, 0, {
        measurer: createFixedMeasurer(),
        styleCascade: styles ? buildStyleCascadeTable(styles.root) : undefined,
      });
      const tables = layout.pages
        .flatMap((page) => page.fragments)
        .filter((fragment) => fragment.kind === 'table');
      const byId = new Map<string, readonly number[]>();
      for (const table of tables) {
        const columns = table.columnEdges
          .slice(1)
          .map((edge, index) => edge - table.columnEdges[index]!);
        // Pagination may repeat a table fragment, but every fragment must keep its columns.
        const known = byId.get(table.tableId);
        if (known) columns.forEach((width, index) => expect(width).toBeCloseTo(known[index]!, 6));
        else byId.set(table.tableId, columns);
      }
      const actual = Array.from(byId.values());
      expect(actual).toHaveLength(scenario.widths.length);
      actual.forEach((columns, index) => {
        expect(columns).toHaveLength(scenario.widths[index]!.length);
        columns.forEach((width, column) =>
          expect(width).toBeCloseTo(scenario.widths[index]![column]!, 6)
        );
      });
      for (const [name, xml] of snapshots) {
        expect(serializeOoxmlPart(pkg.parts.get(name)!)).toBe(xml);
      }
    }
  });
}
