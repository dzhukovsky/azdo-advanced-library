import type { IFilter } from 'azure-devops-ui/Utilities/Filter';
import type { ITreeItem } from 'azure-devops-ui/Utilities/TreeItemProvider';
import { useEffect, useState } from 'react';
import { useVariableGroups } from '@/features/variable-groups/hooks/useVariableGroups';
import type { ObservableMatrixVariable } from '@/features/variable-groups/models';
import { useDerivedObservableArray } from '@/shared/hooks/useObservable';
import { MatrixDataProvider } from './MatrixDataProvider';
import {
  MatrixTree,
  type MatrixTreeItem,
  type VariableGroupName,
} from './MatrixTree';

export type MatrixTabProps = {
  filter: IFilter;
};

type TabContext = {
  groupNames: VariableGroupName[];
};

export const MatrixTab = ({ filter }: MatrixTabProps) => {
  const [context, setContext] = useState<TabContext>(() => ({
    groupNames: [],
  }));

  const [provider, setProvider] = useState(() => new MatrixDataProvider([]));
  const items = useDerivedObservableArray(provider.variables, mapTreeItems);

  const groups = useVariableGroups();

  const isLoading = groups.isLoading;
  const error = groups.error;

  useEffect(() => {
    if (!isLoading) {
      const provider = new MatrixDataProvider(groups.data || []);

      setContext({
        groupNames:
          groups.data?.map<VariableGroupName>((x) => ({
            id: x.id,
            name: x.name,
          })) || [],
      });

      setProvider(provider);
    }
  }, [isLoading, groups.data]);

  if (error) {
    return <div>Error: {(error as Error).message}</div>;
  }

  return (
    <MatrixTree
      groupNames={context.groupNames}
      items={items}
      filter={filter}
      loading={isLoading}
      addNewVariable={() => {
        provider.addNewVariable();
      }}
    />
  );
};

const mapTreeItems = (variables: ObservableMatrixVariable[]) => {
  const rootItems = [
    ...variables.map<ITreeItem<MatrixTreeItem>>((variable) => ({
      data: {
        type: 'variable',
        data: variable,
      },
      childItems: [],
      expanded: false,
    })),
  ];

  return rootItems;
};
