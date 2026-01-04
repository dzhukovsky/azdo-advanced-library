import {
  ObservableMatrixValue,
  ObservableMatrixVariable,
  type VariableGroupId,
} from '@/features/variable-groups/models';
import {
  ObservableObject,
  type ObservableObjectArray,
} from '@/shared/lib/observable';

export class MatrixTabModel extends ObservableObject<MatrixTabModel> {
  readonly variables: ObservableObjectArray<ObservableMatrixVariable>;
  readonly variableGroupIds: Readonly<VariableGroupId[]>;

  constructor(
    variables: ObservableMatrixVariable[],
    variableGroupIds: VariableGroupId[],
  ) {
    super();
    this.variables = this.addArrayProperty(variables);
    this.variableGroupIds = variableGroupIds;
  }

  addNewVariable() {
    const values = this.variableGroupIds.map(
      (groupId) => new ObservableMatrixValue(groupId, '', false, true),
    );

    const newVariable = new ObservableMatrixVariable('', values, false);

    this.variables.push(newVariable);
  }
}
