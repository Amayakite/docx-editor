# Fixed table width references

These synthetic documents reproduce fixed-table width conflicts. All visible text is English test content. They contain no original document text, author metadata, comments, images, or external relationships.

| File | Tables | Reference column widths in points |
| --- | --- | --- |
| `01-two-tables.docx` | Two columns; four columns | `102.05, 351.5`; `68.05, 39.7, 39.7, 306.15` |
| `02-five-columns.docx` | Five columns | `62.35, 85.05, 73.7, 226.75, 45.35` |
| `03-reviewer-control.docx` | Conflict A; control B | Both `60, 90, 210` |

The first two documents retain page geometry, table styles, cell properties, and compatibility mode 14 from the synthetic reproductions. The A/B document has no table width, style part, or compatibility settings. Both tables use a fixed layout and the grid `[1200, 1800, 4200]` in twips. Table A has first-row preferences `[2400, 2400, 2400]`; its second row matches the grid. Both rows of table B match the grid.

## Reference observations

WPS build `12.1.0.26884` reports the widths in the table and renders A/B with aligned column borders. The reporter confirmed normal rendering of the earlier synthetic reproductions in desktop Word and Office 365 web. The reporter also confirmed aligned borders and equal widths in the A/B comparison. Exact Microsoft application builds and numeric Word measurements were not recorded. The English versions change visible text only; table and section properties remain identical. WPS and browser checks were repeated after the text change.

Open the files without editing or saving first. Compare column borders rather than font metrics or page counts. The regression test checks layout and save/reopen behavior; it does not claim complete pagination or typography parity.
