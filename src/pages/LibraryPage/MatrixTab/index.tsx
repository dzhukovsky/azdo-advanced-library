import type {
  VariableGroup,
  VariableValue,
} from 'azure-devops-extension-api/TaskAgent';
import type { IFilter } from 'azure-devops-ui/Utilities/Filter';
import type { ITreeItem } from 'azure-devops-ui/Utilities/TreeItemProvider';
import { useEffect, useState } from 'react';
import { useVariableGroups } from '@/features/variable-groups/hooks/useVariableGroups';
import {
  ObservableMatrixValue,
  ObservableMatrixVariable,
  type VariableGroupId,
} from '@/features/variable-groups/models';
import { MatrixTabModel } from './MatrixTabModel';
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
  items: ITreeItem<MatrixTreeItem>[];
  model: MatrixTabModel;
};

export const MatrixTab = ({ filter }: MatrixTabProps) => {
  const [context, setContext] = useState<TabContext>(() => ({
    groupNames: [],
    items: [],
    model: new MatrixTabModel([], []),
  }));

  const groups = useVariableGroups();

  const isLoading = groups.isLoading;
  const error = groups.error;

  useEffect(() => {
    if (!isLoading) {
      const model = createMatrixTabModel(groups.data ?? []);
      const items = mapTreeItems(model);
      setContext({
        groupNames:
          groups.data?.map<VariableGroupName>((x) => ({
            id: x.id,
            name: x.name,
          })) || [],
        items,
        model,
      });
    }
  }, [isLoading, groups.data]);

  if (error) {
    return <div>Error: {(error as Error).message}</div>;
  }

  return (
    <MatrixTree
      groupNames={context.groupNames}
      items={context.items}
      filter={filter}
      loading={isLoading}
      addNewVariable={() => {
        context.model.addNewVariable();
        const items = mapTreeItems(context.model);
        setContext((prev) => ({
          ...prev,
          items,
        }));
      }}
    />
  );
};

const mapVariables = (variableGroups: VariableGroup[]) => {
  const variableNames = [
    ...new Set<string>(
      variableGroups.flatMap((vg) => Object.keys(vg.variables)),
    ),
  ];

  const values: Record<
    string,
    Record<
      string,
      {
        groupId: VariableGroupId;
        variable: VariableValue;
      }
    >
  > = {};

  variableGroups.forEach((vg) => {
    variableNames.forEach((name) => {
      if (!values[name]) {
        values[name] = {};
      }
      const variable = vg.variables[name];
      values[name][vg.id] = {
        groupId: vg.id,
        variable: variable,
      };
    });
  });

  return variableNames.map((name) => {
    const isSecret = isSecretVariable(variableGroups, name);
    const matrixValues = Object.values(values[name]).map(
      (x) =>
        new ObservableMatrixValue(
          x.groupId,
          x.variable?.value || '',
          x.variable?.isSecret ?? isSecret,
          !x.variable,
        ),
    );

    return new ObservableMatrixVariable(name, matrixValues, isSecret);
  });
};

const isSecretVariable = (
  variableGroups: VariableGroup[],
  variableName: string,
) => {
  const isSecretSet = new Set(
    variableGroups
      .map((vg) => vg.variables[variableName])
      .filter((v) => v)
      .map((v) => v.isSecret ?? false),
  );

  return isSecretSet.size === 1 ? isSecretSet.has(true) : null;
};

const mapTreeItems = (model: MatrixTabModel) => {
  const rootItems = [
    ...model.variables.value.map<ITreeItem<MatrixTreeItem>>((variable) => ({
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

const createMatrixTabModel = (variableGroups: VariableGroup[]) => {
  const variables = mapVariables(variableGroups);
  return new MatrixTabModel(
    variables,
    variableGroups.map((vg) => vg.id),
  );
};
