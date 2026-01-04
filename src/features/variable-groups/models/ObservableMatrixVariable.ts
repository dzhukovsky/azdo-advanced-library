import { States } from '@/shared/components/StateIcon';
import {
  type ObservableObjectValue,
  StateObject,
} from '@/shared/lib/observable';

export type VariableGroupId = number;

export class ObservableMatrixVariable extends StateObject<ObservableMatrixVariable> {
  readonly name: ObservableObjectValue<string>;
  readonly isSecret: ObservableObjectValue<boolean | null>;
  readonly values: Readonly<Record<VariableGroupId, ObservableMatrixValue>>;

  constructor(
    name: string,
    values: ObservableMatrixValue[],
    isSecret: boolean | null,
  ) {
    super(values.every((x) => x.isNew));
    this.name = this.addValueProperty(name);
    this.isSecret = this.addValueProperty(isSecret);
    this.values = values.reduce(
      (acc, val) => {
        acc[val.groupId] = val;
        return acc;
      },
      {} as Record<VariableGroupId, ObservableMatrixValue>,
    );
  }
}

export class ObservableMatrixValue extends StateObject<ObservableMatrixValue> {
  readonly groupId: VariableGroupId;
  readonly isSecretInitial: boolean;
  readonly value: ObservableObjectValue<string>;

  constructor(
    groupId: VariableGroupId,
    value: string,
    isSecret: boolean,
    isNew: boolean,
  ) {
    super(isNew, States.Unchanged);
    this.groupId = groupId;
    this.isSecretInitial = isSecret;
    this.value = this.addValueProperty(value);
  }
}
