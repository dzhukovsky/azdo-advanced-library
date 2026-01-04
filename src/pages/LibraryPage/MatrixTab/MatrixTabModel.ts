import {
  ObservableMatrixValue,
  ObservableMatrixVariable,
  type VariableGroupId,
} from '@/features/variable-groups/models';
import { States } from '@/shared/components/StateIcon';
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
    const values = this.variableGroupIds.map((groupId) => {
      const value = new ObservableMatrixValue(groupId, '', false, true);
      value.state.value = States.New;
      return value;
    });

    const newVariable = new ObservableMatrixVariable('', values, false);

    this.variables.push(newVariable);
  }
}
