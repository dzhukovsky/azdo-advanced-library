import { type State, States, statesEqual } from '@/shared/components/StateIcon';
import { ObservableObject } from './ObservableObject';
import type { ObservableObjectArray } from './ObservableObjectArray';
import { ObservableObjectValue } from './ObservableObjectValue';

export abstract class StateObject<T> extends ObservableObject<T> {
  readonly state: ObservableObjectValue<State>;
  readonly isNew: boolean;

  constructor(isNew: boolean, initialState?: State) {
    super();
    this.isNew = isNew;

    const state = isNew ? States.New : States.Unchanged;
    this.state = new ObservableObjectValue(initialState ?? state, statesEqual);

    this.subscribe(() => {
      this.state.value = this.modified && !isNew ? States.Modified : state;
    });
  }
}

export function getArrayChanges<T extends StateObject<T>>(
  items: ObservableObjectArray<T>,
) {
  return [
    ...items.initialItems.filter((item) => item.state.value === States.Deleted),
    ...items.value.filter((item) => item.state.value !== States.Unchanged),
  ];
}
