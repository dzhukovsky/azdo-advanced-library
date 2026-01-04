import type { MatrixTreeRenderer } from '../MatrixTree';

export const folderRenderer: MatrixTreeRenderer['folder'] = {
  name: {
    renderCell: ({ data }) => data,
    renderActions: () => null,
  },
  value: {
    renderCell: () => null,
    renderActions: () => null,
  },
};
