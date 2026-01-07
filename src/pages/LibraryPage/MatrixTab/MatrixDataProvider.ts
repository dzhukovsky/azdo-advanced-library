import type { VariableGroup } from 'azure-devops-extension-api/TaskAgent';
import {
  type GroupId,
  type IVariableValue,
  ObservableMatrixVariable,
} from '@/features/variable-groups/models';
import {
  ObservableObject,
  type ObservableObjectArray,
} from '@/shared/lib/observable';

export class MatrixDataProvider extends ObservableObject<MatrixDataProvider> {
  readonly groupIds: GroupId[];
  readonly variables: ObservableObjectArray<ObservableMatrixVariable>;

  constructor(variableGroups: VariableGroup[]) {
    super();
    this.groupIds = variableGroups.map((vg) => vg.id);
    this.variables = this.addArrayProperty(mapVariables(variableGroups));
  }

  addNewVariable() {
    this.variables.push(new ObservableMatrixVariable('', [], this.groupIds));
  }
}

const mapVariables = (variableGroups: VariableGroup[]) => {
  const groupIds = variableGroups.map((vg) => vg.id);

  const variableNames = [
    ...new Set<string>(
      variableGroups.flatMap((vg) => Object.keys(vg.variables)),
    ),
  ];

  const values: Record<string, Record<GroupId, IVariableValue>> = {};

  variableGroups.forEach((vg) => {
    variableNames.forEach((name) => {
      if (!values[name]) {
        values[name] = {};
      }

      const variable = vg.variables[name];
      if (variable) {
        values[name][vg.id] = {
          groupId: vg.id,
          isSecret: variable.isSecret ?? false,
          value: variable.value ?? '',
        };
      }
    });
  });

  return variableNames.map(
    (name) => new ObservableMatrixVariable(name, values[name], groupIds),
  );
};
