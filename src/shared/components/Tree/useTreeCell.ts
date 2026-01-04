import type { IFocusWithinStatus } from 'azure-devops-ui/FocusWithin';
import type { IMouseWithinStatus } from 'azure-devops-ui/MouseWithin';
import { createContext, useContext } from 'react';

export type TreeCellContextValue = IMouseWithinStatus & IFocusWithinStatus;

export const TreeCellContext = createContext<TreeCellContextValue | undefined>(
  undefined,
);

export const useTreeCell = (): TreeCellContextValue => {
  const ctx = useContext(TreeCellContext);
  if (!ctx) {
    throw new Error(
      'useTreeCell must be used inside <TreeCellContext.Provider>',
    );
  }
  return ctx;
};
