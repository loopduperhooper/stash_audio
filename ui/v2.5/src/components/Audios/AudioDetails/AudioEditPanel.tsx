import React, { useEffect, useState, useMemo } from "react";
import { useIntl } from "react-intl";
import { Button, Form } from "react-bootstrap";
import Mousetrap from "mousetrap";
import * as GQL from "src/core/generated-graphql";
import * as yup from "yup";
import { useFormik } from "formik";
import { Prompt } from "react-router-dom";
import { LoadingIndicator } from "src/components/Shared/LoadingIndicator";
import { ImageInput } from "src/components/Shared/ImageInput";
import { useToast } from "src/hooks/Toast";
import ImageUtils from "src/utils/image";
import { useTagsEdit } from "src/hooks/tagsEdit";
import {
  Performer,
  PerformerSelect,
} from "src/components/Performers/PerformerSelect";
import { Studio, StudioSelect } from "src/components/Studios/StudioSelect";
import { formikUtils } from "src/utils/form";
import {
  yupDateString,
  yupFormikValidate,
  yupUniqueStringList,
} from "src/utils/yup";

interface IProps {
  audio: GQL.AudioDataFragment;
  isVisible: boolean;
  onSubmit: (input: GQL.AudioUpdateInput) => Promise<void>;
  onDelete: () => void;
}

export const AudioEditPanel: React.FC<IProps> = ({
  audio,
  isVisible,
  onSubmit,
  onDelete,
}) => {
  const intl = useIntl();
  const Toast = useToast();

  const [performers, setPerformers] = useState<Performer[]>([]);
  const [studio, setStudio] = useState<Studio | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPerformers(audio.performers ?? []);
  }, [audio.performers]);

  useEffect(() => {
    setStudio(audio.studio ?? null);
  }, [audio.studio]);

  const schema = yup.object({
    title: yup.string().ensure(),
    urls: yupUniqueStringList(intl),
    date: yupDateString(intl),
    studio_id: yup.string().required().nullable(),
    performer_ids: yup.array(yup.string().required()).defined(),
    tag_ids: yup.array(yup.string().required()).defined(),
    details: yup.string().ensure(),
    cover_image: yup.string().nullable().optional(),
  });

  const initialValues = useMemo(
    () => ({
      title: audio.title ?? "",
      urls: audio.urls ?? [],
      date: audio.date ?? "",
      studio_id: audio.studio?.id ?? null,
      performer_ids: (audio.performers ?? []).map((p) => p.id),
      tag_ids: (audio.tags ?? []).map((t) => t.id),
      details: audio.details ?? "",
      cover_image: undefined as string | null | undefined,
    }),
    [audio]
  );

  type InputValues = yup.InferType<typeof schema>;

  const formik = useFormik<InputValues>({
    initialValues,
    enableReinitialize: true,
    validate: yupFormikValidate(schema),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await onSubmit({
          id: audio.id,
          ...schema.cast(values),
        });
        formik.resetForm();
      } catch (e) {
        Toast.error(e);
      }
      setIsLoading(false);
    },
  });

  const { tags, tagsControl } = useTagsEdit(audio.tags, (ids) =>
    formik.setFieldValue("tag_ids", ids)
  );

  // silence unused warning — tags is used by tagsControl
  void tags;

  const coverImagePreview = useMemo(() => {
    const audioImage = audio.paths?.cover;
    const formImage = formik.values.cover_image;
    if (formImage === null && audioImage) {
      const url = new URL(audioImage);
      url.searchParams.set("default", "true");
      return url.toString();
    } else if (formImage) {
      return formImage;
    }
    return audioImage;
  }, [formik.values.cover_image, audio.paths?.cover]);

  const encodingImage = ImageUtils.usePasteImage(onImageLoad);

  function onImageLoad(imageData: string) {
    formik.setFieldValue("cover_image", imageData);
  }

  function onCoverImageChange(event: React.FormEvent<HTMLInputElement>) {
    ImageUtils.onImageChange(event, onImageLoad);
  }

  function onResetCover() {
    formik.setFieldValue("cover_image", null);
  }

  function onSetPerformers(items: Performer[]) {
    setPerformers(items);
    formik.setFieldValue(
      "performer_ids",
      items.map((i) => i.id)
    );
  }

  function onSetStudio(item: Studio | null) {
    setStudio(item);
    formik.setFieldValue("studio_id", item ? item.id : null);
  }

  useEffect(() => {
    if (isVisible) {
      Mousetrap.bind("s s", () => {
        if (formik.dirty) {
          formik.submitForm();
        }
      });
      Mousetrap.bind("d d", () => {
        onDelete();
      });

      return () => {
        Mousetrap.unbind("s s");
        Mousetrap.unbind("d d");
      };
    }
  });

  if (isLoading) return <LoadingIndicator />;

  const splitProps = {
    labelProps: { column: true, sm: 3 },
    fieldProps: { sm: 9 },
  };
  const fullWidthProps = {
    labelProps: { column: true, sm: 3, xl: 12 },
    fieldProps: { sm: 9, xl: 12 },
  };
  const urlProps = {
    labelProps: { column: true, md: 3, lg: 12 },
    fieldProps: { md: 9, lg: 12 },
  };

  const { renderField, renderInputField, renderDateField, renderURLListField } =
    formikUtils(intl, formik, splitProps);

  const coverImage = encodingImage ? (
    <LoadingIndicator
      message={intl.formatMessage({ id: "actions.encoding_image" })}
    />
  ) : coverImagePreview ? (
    <img
      className="scene-cover"
      src={coverImagePreview}
      alt={intl.formatMessage({ id: "cover_image" })}
    />
  ) : (
    <div />
  );

  return (
    <div id="audio-edit-details">
      <Prompt
        when={formik.dirty}
        message={intl.formatMessage({ id: "dialogs.unsaved_changes" })}
      />

      <Form noValidate onSubmit={formik.handleSubmit}>
        {renderInputField("title", "text", "title")}
        {renderURLListField("urls", "urls", onSubmit, urlProps)}
        {renderDateField("date", "date")}

        {renderField(
          "studio_id",
          intl.formatMessage({ id: "studio" }),
          <StudioSelect
            onSelect={(items) =>
              onSetStudio(items.length > 0 ? items[0] : null)
            }
            values={studio ? [studio] : []}
          />
        )}

        {renderField(
          "performer_ids",
          intl.formatMessage({ id: "performers" }),
          <PerformerSelect
            isMulti
            onSelect={onSetPerformers}
            values={performers}
          />,
          fullWidthProps
        )}

        {renderField(
          "tag_ids",
          intl.formatMessage({ id: "tags" }),
          tagsControl(),
          fullWidthProps
        )}

        {renderInputField("details", "textarea", "details", {
          labelProps: { column: true, sm: 3, lg: 12 },
          fieldProps: { sm: 9, lg: 12 },
        })}

        <Form.Group controlId="cover-image">
          <Form.Label>
            {intl.formatMessage({ id: "cover_image" })}
          </Form.Label>
          <div>{coverImage}</div>
          <ImageInput
            isEditing
            onImageChange={onCoverImageChange}
            onImageURL={(url) => formik.setFieldValue("cover_image", url)}
          />
          {audio.paths?.cover && formik.values.cover_image !== null && (
            <Button
              className="mt-2"
              variant="danger"
              onClick={onResetCover}
            >
              {intl.formatMessage({ id: "actions.reset_cover_image" })}
            </Button>
          )}
        </Form.Group>

        <Button
          variant="primary"
          disabled={!formik.dirty || !formik.isValid}
          onClick={() => formik.submitForm()}
        >
          {intl.formatMessage({ id: "actions.save" })}
        </Button>
      </Form>
    </div>
  );
};
