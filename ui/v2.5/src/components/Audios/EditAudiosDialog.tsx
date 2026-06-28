import React, { useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { useIntl } from "react-intl";
import { useBulkAudioUpdate } from "src/core/StashService";
import * as GQL from "src/core/generated-graphql";
import { StudioSelect } from "../Shared/Select";
import { ModalComponent } from "../Shared/Modal";
import { MultiSet } from "../Shared/MultiSet";
import { useToast } from "src/hooks/Toast";
import { RatingSystem } from "../Shared/Rating/RatingSystem";
import {
  getAggregateInputValue,
  getAggregatePerformerIds,
  getAggregateStateObject,
  getAggregateTagIds,
  getAggregateStudioId,
} from "src/utils/bulkUpdate";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { IndeterminateCheckbox } from "../Shared/IndeterminateCheckbox";
import { BulkUpdateFormGroup, BulkUpdateTextInput } from "../Shared/BulkUpdate";
import { BulkUpdateDateInput } from "../Shared/DateInput";
import { getDateError } from "src/utils/yup";

interface IListOperationProps {
  selected: GQL.SlimAudioDataFragment[];
  onClose: (applied: boolean) => void;
}

const audioFields = ["rating100", "details", "organized", "date"];

export const EditAudiosDialog: React.FC<IListOperationProps> = ({
  selected,
  onClose,
}) => {
  const intl = useIntl();
  const Toast = useToast();

  const [updateInput, setUpdateInput] = useState<GQL.BulkAudioUpdateInput>({
    ids: selected.map((a) => a.id),
  });

  const [performerIds, setPerformerIds] = useState<GQL.BulkUpdateIds>({
    mode: GQL.BulkUpdateIdMode.Add,
  });
  const [tagIds, setTagIds] = useState<GQL.BulkUpdateIds>({
    mode: GQL.BulkUpdateIdMode.Add,
  });

  const unsetDisabled = selected.length < 2;
  const [dateError, setDateError] = useState<string | undefined>();
  const [isUpdating, setIsUpdating] = useState(false);

  const [updateAudios] = useBulkAudioUpdate();

  const aggregateState = useMemo(() => {
    const updateState: Partial<GQL.BulkAudioUpdateInput> = {};
    updateState.studio_id = getAggregateStudioId(selected);
    const updateTagIds = getAggregateTagIds(selected);
    const updatePerformerIds = getAggregatePerformerIds(selected);
    let first = true;

    selected.forEach((audio) => {
      getAggregateStateObject(updateState, audio, audioFields, first);
      first = false;
    });

    return {
      state: updateState,
      tagIds: updateTagIds,
      performerIds: updatePerformerIds,
    };
  }, [selected]);

  useEffect(() => {
    setUpdateInput((current) => ({ ...current, ...aggregateState.state }));
  }, [aggregateState]);

  useEffect(() => {
    setDateError(getDateError(updateInput.date ?? "", intl));
  }, [updateInput.date, intl]);

  function setUpdateField(input: Partial<GQL.BulkAudioUpdateInput>) {
    setUpdateInput((current) => ({ ...current, ...input }));
  }

  function getAudioInput(): GQL.BulkAudioUpdateInput {
    const input: GQL.BulkAudioUpdateInput = {
      ...updateInput,
      tag_ids: tagIds,
      performer_ids: performerIds,
    };

    input.rating100 = getAggregateInputValue(
      updateInput.rating100,
      aggregateState.state.rating100
    );

    return input;
  }

  async function onSave() {
    setIsUpdating(true);
    try {
      await updateAudios({ variables: { input: getAudioInput() } });
      Toast.success(
        intl.formatMessage(
          { id: "toast.updated_entity" },
          {
            entity: intl
              .formatMessage({ id: "audios" })
              .toLocaleLowerCase(),
          }
        )
      );
      onClose(true);
    } catch (e) {
      Toast.error(e);
    }
    setIsUpdating(false);
  }

  return (
    <ModalComponent
      show
      icon={faPencilAlt}
      header={intl.formatMessage(
        { id: "dialogs.edit_entity_count_title" },
        {
          count: selected?.length ?? 1,
          singularEntity: intl.formatMessage({ id: "audio" }),
          pluralEntity: intl.formatMessage({ id: "audios" }),
        }
      )}
      accept={{
        onClick: onSave,
        text: intl.formatMessage({ id: "actions.apply" }),
      }}
      disabled={isUpdating || !!dateError}
      cancel={{
        onClick: () => onClose(false),
        text: intl.formatMessage({ id: "actions.cancel" }),
        variant: "secondary",
      }}
      isRunning={isUpdating}
    >
      <Form>
        <BulkUpdateFormGroup name="rating">
          <RatingSystem
            value={updateInput.rating100}
            onSetRating={(value) =>
              setUpdateField({ rating100: value ?? undefined })
            }
            disabled={isUpdating}
          />
        </BulkUpdateFormGroup>

        <BulkUpdateFormGroup name="date">
          <BulkUpdateDateInput
            value={updateInput.date}
            valueChanged={(newValue) => setUpdateField({ date: newValue })}
            unsetDisabled={unsetDisabled}
            error={dateError}
          />
        </BulkUpdateFormGroup>

        <BulkUpdateFormGroup name="studio">
          <StudioSelect
            onSelect={(items) =>
              setUpdateField({
                studio_id: items.length > 0 ? items[0]?.id : undefined,
              })
            }
            ids={updateInput.studio_id ? [updateInput.studio_id] : []}
            isDisabled={isUpdating}
            menuPortalTarget={document.body}
          />
        </BulkUpdateFormGroup>

        <BulkUpdateFormGroup name="performers" inline={false}>
          <MultiSet
            type="performers"
            disabled={isUpdating}
            onUpdate={(itemIDs) => {
              setPerformerIds((c) => ({ ...c, ids: itemIDs }));
            }}
            onSetMode={(newMode) => {
              setPerformerIds((c) => ({ ...c, mode: newMode }));
            }}
            ids={performerIds.ids ?? []}
            existingIds={aggregateState.performerIds}
            mode={performerIds.mode}
            menuPortalTarget={document.body}
          />
        </BulkUpdateFormGroup>

        <BulkUpdateFormGroup name="tags" inline={false}>
          <MultiSet
            type="tags"
            disabled={isUpdating}
            onUpdate={(itemIDs) => {
              setTagIds((c) => ({ ...c, ids: itemIDs }));
            }}
            onSetMode={(newMode) => {
              setTagIds((c) => ({ ...c, mode: newMode }));
            }}
            ids={tagIds.ids ?? []}
            existingIds={aggregateState.tagIds}
            mode={tagIds.mode}
            menuPortalTarget={document.body}
          />
        </BulkUpdateFormGroup>

        <BulkUpdateFormGroup name="details" inline={false}>
          <BulkUpdateTextInput
            value={updateInput.details}
            valueChanged={(newValue) => setUpdateField({ details: newValue })}
            unsetDisabled={unsetDisabled}
            as="textarea"
          />
        </BulkUpdateFormGroup>

        <Form.Group controlId="organized">
          <IndeterminateCheckbox
            label={intl.formatMessage({ id: "organized" })}
            setChecked={(checked) => setUpdateField({ organized: checked })}
            checked={updateInput.organized ?? undefined}
          />
        </Form.Group>
      </Form>
    </ModalComponent>
  );
};
