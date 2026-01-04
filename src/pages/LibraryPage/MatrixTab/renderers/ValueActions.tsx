import { Button } from 'azure-devops-ui/Button';
import { Observer } from 'azure-devops-ui/Observer';
import type { ObservableMatrixValue } from '@/features/variable-groups/models';
import { StateIcon, States } from '@/shared/components/StateIcon';
import { useTreeCell } from '@/shared/components/Tree/useTreeCell';

export const ValueActions = ({ data }: { data: ObservableMatrixValue }) => {
  const { hasMouse, hasFocus, onBlur } = useTreeCell();
  const hasMouseOrFocus = hasMouse || hasFocus;

  if (!hasMouseOrFocus) {
    return <StateIcon state={data.state.value} />;
  }

  return (
    <Observer state={data.state} isNew={data.isNew}>
      {({ state, isNew }) => {
        if (state === States.Deleted) {
          return (
            <Button
              subtle
              iconProps={{ iconName: 'Undo' }}
              tooltipProps={{ text: 'Restore value' }}
              onClick={() => {
                data.state.value = data.modified
                  ? States.Modified
                  : States.Unchanged;
                onBlur?.();
              }}
            />
          );
        }

        if (state === States.Unchanged && isNew) {
          return (
            <Button
              subtle
              iconProps={{ iconName: 'Add' }}
              tooltipProps={{ text: 'Add new variable' }}
              onClick={(e) => {
                data.state.value = States.New;
                const element = e.currentTarget;
                window.requestAnimationFrame(() => selectClosestInput(element));
                e.stopPropagation();
              }}
            />
          );
        }

        return (
          <Button
            subtle
            iconProps={{ iconName: 'Delete' }}
            tooltipProps={{ text: 'Delete value' }}
            onClick={() => {
              if (isNew) {
                data.value.reset();
                data.state.reset();
                onBlur?.();

                return;
              }

              data.state.value = States.Deleted;
            }}
          />
        );
      }}
    </Observer>
  );
};

function selectClosestInput(element: HTMLElement) {
  const input = element.parentElement?.querySelector('input');
  input?.select();
}
