import { States } from '@/shared/components/StateIcon';
import {
  ObservableObject,
  type ObservableObjectValue,
  StateObject,
} from '@/shared/lib/observable';

export type GroupId = number;

export interface IVariableValue {
  groupId: GroupId;
  value: string;
  isSecret: boolean;
}

export class ObservableMatrixVariable extends ObservableObject<ObservableMatrixVariable> {
  readonly name: ObservableMatrixName;
  readonly values: Readonly<Record<GroupId, ObservableMatrixValue>>;

  constructor(
    name: string,
    values: Record<GroupId, IVariableValue>,
    groupIds: Readonly<GroupId[]>,
  ) {
    super();
    const isSecret = isSecretVariable(Object.values(values));
    this.name = this.addProperty(
      new ObservableMatrixName(name, isSecret, false),
    );

    this.values = groupIds.reduce(
      (acc, groupId) => {
        const value = values[groupId];
        acc[groupId] = this.addProperty(
          new ObservableMatrixValue(
            value?.value ?? '',
            value?.isSecret ?? false,
            !value,
          ),
        );
        return acc;
      },
      {} as Record<GroupId, ObservableMatrixValue>,
    );
  }

  deleteVariable(groupId: GroupId) {
    const variable = this.values[groupId];

    if (variable.isNew) {
      variable.value.reset();
      variable.state.reset();
      return;
    }

    variable.state.value = States.Deleted;
  }

  restoreVariable(groupId: GroupId) {
    const variable = this.values[groupId];
    variable.state.value = variable.modified
      ? States.Modified
      : States.Unchanged;
  }

  search(filterText: string): boolean {
    return (
      this.name.name.value?.toLocaleLowerCase().includes(filterText) ||
      Object.values(this.values).some((x) =>
        x.value.value?.toLocaleLowerCase().includes(filterText),
      )
    );
  }
}

export class ObservableMatrixName extends StateObject<ObservableMatrixName> {
  readonly name: ObservableObjectValue<string>;
  readonly isSecret: ObservableObjectValue<boolean | null>;

  constructor(name: string, isSecret: boolean | null, isNew: boolean) {
    super(isNew, States.Unchanged);
    this.name = this.addValueProperty(name);
    this.isSecret = this.addValueProperty(isSecret);
  }
}

export class ObservableMatrixValue extends StateObject<ObservableMatrixValue> {
  readonly isSecretInitial: boolean;
  readonly value: ObservableObjectValue<string>;

  constructor(value: string, isSecret: boolean, isNew: boolean) {
    super(isNew, States.Unchanged);
    this.isSecretInitial = isSecret;
    this.value = this.addValueProperty(value);
  }
}

const isSecretVariable = (values: IVariableValue[]): boolean | null => {
  if (!values.length) return false;

  const first = values[0].isSecret;

  for (let i = 1; i < values.length; i++) {
    if (values[i].isSecret !== first) return null;
  }

  return first;
};
