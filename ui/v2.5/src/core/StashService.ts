import {
  ApolloCache,
  DocumentNode,
  FetchResult,
  NetworkStatus,
  useQuery,
} from "@apollo/client";
import { Modifiers } from "@apollo/client/cache";
import {
  isField,
  getQueryDefinition,
  StoreObject,
} from "@apollo/client/utilities";
import { ListFilterModel } from "../models/list-filter/filter";
import * as GQL from "./generated-graphql";

import { createClient } from "./createClient";
import { Client } from "graphql-ws";
import { useEffect, useState } from "react";

const { client, wsClient, cache: clientCache } = createClient();

export const getClient = () => client;
export const getWSClient = () => wsClient;

export function useWSState(ws: Client) {
  const [state, setState] = useState<"connecting" | "connected" | "error">(
    "connecting"
  );

  useEffect(() => {
    const disposeConnected = ws.on("connected", () => {
      setState("connected");
    });

    const disposeError = ws.on("error", () => {
      setState("error");
    });

    return () => {
      disposeConnected();
      disposeError();
    };
  }, [ws]);

  return { state };
}

// Evicts cached results for the given queries.
// Will also call a cache GC afterwards.
export function evictQueries(
  cache: ApolloCache<unknown>,
  queries: DocumentNode[]
) {
  const fields: Modifiers = {};
  for (const query of queries) {
    const { selections } = getQueryDefinition(query).selectionSet;
    for (const field of selections) {
      if (!isField(field)) continue;
      const keyName = field.name.value;
      fields[keyName] = (_value, { DELETE }) => DELETE;
    }
  }

  cache.modify({ fields });

  // evictQueries is usually called at the end of
  // an update function - so call a GC here
  cache.gc();
}

/**
 * Evicts fields from all objects of a given type.
 *
 * @param input   a map from typename -> list of field names to evict
 * @param ignore  optionally specify a cache id to ignore and not modify
 */
function evictTypeFields(
  cache: ApolloCache<Record<string, StoreObject>>,
  input: Record<string, string[]>,
  ignore?: string
) {
  const data = cache.extract();
  for (const key in data) {
    if (ignore?.includes(key)) continue;

    const obj = data[key];
    const typename = obj.__typename;

    if (typename && input[typename]) {
      const modifiers: Modifiers = {};
      for (const field of input[typename]) {
        modifiers[field] = (_value, { DELETE }) => DELETE;
      }
      cache.modify({
        id: key,
        fields: modifiers,
      });
    }
  }
}

// Deletes obj from the cache, and sets the
// cached result of the given query to null.
// Use with "Destroy" mutations.
function deleteObject(
  cache: ApolloCache<unknown>,
  obj: StoreObject,
  query: DocumentNode
) {
  const field = getQueryDefinition(query).selectionSet.selections[0];
  if (!isField(field)) return;
  const keyName = field.name.value;

  cache.writeQuery({
    query,
    variables: { id: obj.id },
    data: { [keyName]: null },
  });
  cache.evict({ id: cache.identify(obj) });
}

export function isLoading(networkStatus: NetworkStatus) {
  // useQuery hook loading field only returns true when initially loading the query
  // and not during subsequent fetches
  return (
    networkStatus === NetworkStatus.loading ||
    networkStatus === NetworkStatus.fetchMore ||
    networkStatus === NetworkStatus.refetch
  );
}

/// Object queries

export const useFindAudio = (id: string) =>
  GQL.useFindAudioQuery({ variables: { id } });

export const useFindAudios = (filter?: ListFilterModel) =>
  GQL.useFindAudiosQuery({
    skip: filter === undefined,
    variables: {
      filter: filter?.makeFindFilter(),
      audio_filter: filter?.makeFilter(),
    },
  });

export const useFindAudiosMetadata = (filter?: ListFilterModel) =>
  GQL.useFindAudiosMetadataQuery({
    skip: filter === undefined,
    variables: {
      filter: filter?.makeFindFilter(),
      audio_filter: filter?.makeFilter(),
    },
  });

export const queryFindAudios = (filter: ListFilterModel) =>
  client.query<GQL.FindAudiosQuery>({
    query: GQL.FindAudiosDocument,
    variables: {
      filter: filter.makeFindFilter(),
      audio_filter: filter.makeFilter(),
    },
  });

export const useAudioUpdate = () => GQL.useAudioUpdateMutation();

export const useBulkAudioUpdate = () => GQL.useBulkAudioUpdateMutation();

export const useAudioIncrementO = () =>
  GQL.useAudioIncrementOMutation({
    update(cache, result, { variables }) {
      if (result.data?.audioIncrementO === undefined || !variables?.id) return;
      updateO(cache, "Audio", variables.id, result.data.audioIncrementO);
    },
  });
export const useAudioDecrementO = () =>
  GQL.useAudioDecrementOMutation({
    update(cache, result, { variables }) {
      if (result.data?.audioDecrementO === undefined || !variables?.id) return;
      updateO(cache, "Audio", variables.id, result.data.audioDecrementO);
    },
  });

export const useAudioIncrementPlayCount = () =>
  GQL.useAudioIncrementPlayCountMutation();

export const useAudioSaveActivity = () => GQL.useAudioSaveActivityMutation();

export const useAudioDestroy = () => GQL.useAudioDestroyMutation();

export const useAudiosDestroy = (input: GQL.AudiosDestroyInput) =>
  GQL.useAudiosDestroyMutation({
    variables: {
      ids: input.ids,
      delete_file: input.delete_file,
      delete_generated: input.delete_generated,
    },
  });

export const useFindGroup = (id: string) => {
  const skip = id === "new" || id === "";
  return GQL.useFindGroupQuery({ variables: { id }, skip });
};

export const useFindGroups = (filter?: ListFilterModel) =>
  GQL.useFindGroupsQuery({
    skip: filter === undefined,
    variables: {
      filter: filter?.makeFindFilter(),
      group_filter: filter?.makeFilter(),
    },
  });

export const queryFindGroups = (filter: ListFilterModel) =>
  client.query<GQL.FindGroupsQuery>({
    query: GQL.FindGroupsDocument,
    variables: {
      filter: filter.makeFindFilter(),
      group_filter: filter.makeFilter(),
    },
  });

export const queryFindGroupsByIDForSelect = (groupIDs: string[]) =>
  client.query<GQL.FindGroupsForSelectQuery>({
    query: GQL.FindGroupsForSelectDocument,
    variables: {
      ids: groupIDs,
    },
  });

export const queryFindGroupsForSelect = (filter: ListFilterModel) =>
  client.query<GQL.FindGroupsForSelectQuery>({
    query: GQL.FindGroupsForSelectDocument,
    variables: {
      filter: filter.makeFindFilter(),
      group_filter: filter.makeFilter(),
    },
  });

export const useFindPerformer = (id: string) => {
  const skip = id === "new" || id === "";
  return GQL.useFindPerformerQuery({ variables: { id }, skip });
};

export const queryFindPerformer = (id: string) =>
  client.query<GQL.FindPerformerQuery>({
    query: GQL.FindPerformerDocument,
    variables: { id },
  });

export const useFindPerformers = (filter?: ListFilterModel) =>
  GQL.useFindPerformersQuery({
    skip: filter === undefined,
    variables: {
      filter: filter?.makeFindFilter(),
      performer_filter: filter?.makeFilter(),
    },
  });

export const queryFindPerformers = (filter: ListFilterModel) =>
  client.query<GQL.FindPerformersQuery>({
    query: GQL.FindPerformersDocument,
    variables: {
      filter: filter.makeFindFilter(),
      performer_filter: filter.makeFilter(),
    },
  });

export const queryFindPerformersByID = (performerIDs: number[]) =>
  client.query<GQL.FindPerformersQuery>({
    query: GQL.FindPerformersDocument,
    variables: {
      performer_ids: performerIDs,
    },
  });

export const queryFindPerformersByIDForSelect = (performerIDs: string[]) =>
  client.query<GQL.FindPerformersForSelectQuery>({
    query: GQL.FindPerformersForSelectDocument,
    variables: {
      ids: performerIDs,
    },
  });

export const queryFindPerformersForSelect = (filter: ListFilterModel) =>
  client.query<GQL.FindPerformersForSelectQuery>({
    query: GQL.FindPerformersForSelectDocument,
    variables: {
      filter: filter.makeFindFilter(),
      performer_filter: filter.makeFilter(),
    },
  });

export const useFindStudio = (id: string) => {
  const skip = id === "new" || id === "";
  return GQL.useFindStudioQuery({ variables: { id }, skip });
};

export const queryFindStudio = (id: string) =>
  client.query<GQL.FindStudioQuery>({
    query: GQL.FindStudioDocument,
    variables: { id },
  });

export const useFindStudios = (filter?: ListFilterModel) =>
  GQL.useFindStudiosQuery({
    skip: filter === undefined,
    variables: {
      filter: filter?.makeFindFilter(),
      studio_filter: filter?.makeFilter(),
    },
  });

export const queryFindStudios = (filter: ListFilterModel) =>
  client.query<GQL.FindStudiosQuery>({
    query: GQL.FindStudiosDocument,
    variables: {
      filter: filter.makeFindFilter(),
      studio_filter: filter.makeFilter(),
    },
  });

export const queryFindStudiosByIDForSelect = (studioIDs: string[]) =>
  client.query<GQL.FindStudiosForSelectQuery>({
    query: GQL.FindStudiosForSelectDocument,
    variables: {
      ids: studioIDs,
    },
  });

export const queryFindStudiosForSelect = (filter: ListFilterModel) =>
  client.query<GQL.FindStudiosForSelectQuery>({
    query: GQL.FindStudiosForSelectDocument,
    variables: {
      filter: filter.makeFindFilter(),
      studio_filter: filter.makeFilter(),
    },
  });

export const useFindTag = (id: string) => {
  const skip = id === "new" || id === "";
  return GQL.useFindTagQuery({ variables: { id }, skip });
};

export const queryFindTag = (id: string) =>
  client.query<GQL.FindTagQuery>({
    query: GQL.FindTagDocument,
    variables: { id },
  });

export const useFindTags = (filter?: ListFilterModel) =>
  GQL.useFindTagsQuery({
    skip: filter === undefined,
    variables: {
      filter: filter?.makeFindFilter(),
      tag_filter: filter?.makeFilter(),
    },
  });

// Optimized query for tag list page - excludes expensive recursive *_count_all fields
export const useFindTagsForList = (filter?: ListFilterModel) =>
  GQL.useFindTagsForListQuery({
    skip: filter === undefined,
    variables: {
      filter: filter?.makeFindFilter(),
      tag_filter: filter?.makeFilter(),
    },
  });

export const queryFindTags = (filter: ListFilterModel) =>
  client.query<GQL.FindTagsQuery>({
    query: GQL.FindTagsDocument,
    variables: {
      filter: filter.makeFindFilter(),
      tag_filter: filter.makeFilter(),
    },
  });

// Optimized query for tag list page
export const queryFindTagsForList = (filter: ListFilterModel) =>
  client.query<GQL.FindTagsForListQuery>({
    query: GQL.FindTagsForListDocument,
    variables: {
      filter: filter.makeFindFilter(),
      tag_filter: filter.makeFilter(),
    },
  });

export const queryFindTagsByID = (tagIDs: string[]) =>
  client.query<GQL.FindTagsQuery>({
    query: GQL.FindTagsDocument,
    variables: {
      ids: tagIDs,
    },
  });

export const queryFindTagsByIDForSelect = (tagIDs: string[]) =>
  client.query<GQL.FindTagsForSelectQuery>({
    query: GQL.FindTagsForSelectDocument,
    variables: {
      ids: tagIDs,
    },
  });

export const queryFindTagsForSelect = (filter: ListFilterModel) =>
  client.query<GQL.FindTagsForSelectQuery>({
    query: GQL.FindTagsForSelectDocument,
    variables: {
      filter: filter.makeFindFilter(),
      tag_filter: filter.makeFilter(),
    },
  });

export const useFindSavedFilter = (id: string) =>
  GQL.useFindSavedFilterQuery({
    variables: { id },
  });

export const useFindSavedFilters = (mode?: GQL.FilterMode) =>
  GQL.useFindSavedFiltersQuery({
    variables: { mode },
  });

export const queryFindSubFolders = (id: string) =>
  client.query<GQL.FindFoldersForQueryQuery>({
    query: GQL.FindFoldersForQueryDocument,
    variables: {
      folder_filter: {
        parent_folder: { value: id, modifier: GQL.CriterionModifier.Equals },
      },
      filter: {
        per_page: -1,
        sort: "basename",
        direction: GQL.SortDirectionEnum.Asc,
      },
    },
  });

/// Object Mutations

// Increases/decreases the given field of the Stats query by diff
function updateStats(cache: ApolloCache<unknown>, field: string, diff: number) {
  cache.modify({
    fields: {
      stats(value) {
        return {
          ...value,
          [field]: value[field] + diff,
        };
      },
    },
  });
}

function updateO(
  cache: ApolloCache<unknown>,
  typename: string,
  id: string,
  updatedOCount: number
) {
  cache.modify({
    id: cache.identify({ __typename: typename, id }),
    fields: {
      o_counter() {
        return updatedOCount;
      },
    },
  });
}

const groupMutationImpactedTypeFields = {
  Performer: ["group_count"],
  Studio: ["group_count"],
};

const groupMutationImpactedQueries = [
  GQL.FindGroupsDocument, // various filters
];

export const useGroupCreate = () =>
  GQL.useGroupCreateMutation({
    update(cache, result) {
      const group = result.data?.groupCreate;
      if (!group) return;

      // update stats
      updateStats(cache, "group_count", 1);

      evictTypeFields(cache, groupMutationImpactedTypeFields);
      evictQueries(cache, groupMutationImpactedQueries);
    },
  });

export const useGroupUpdate = () =>
  GQL.useGroupUpdateMutation({
    update(cache, result) {
      if (!result.data?.groupUpdate) return;

      evictTypeFields(cache, groupMutationImpactedTypeFields);
      evictQueries(cache, groupMutationImpactedQueries);
    },
  });

export const useBulkGroupUpdate = () =>
  GQL.useBulkGroupUpdateMutation({
    update(cache, result) {
      if (!result.data?.bulkGroupUpdate) return;

      evictTypeFields(cache, groupMutationImpactedTypeFields);
      evictQueries(cache, groupMutationImpactedQueries);
    },
  });

export const useGroupDestroy = (input: GQL.GroupDestroyInput) =>
  GQL.useGroupDestroyMutation({
    variables: input,
    update(cache, result) {
      if (!result.data?.groupDestroy) return;

      const obj = { __typename: "Group", id: input.id };
      deleteObject(cache, obj, GQL.FindGroupDocument);

      // update stats
      updateStats(cache, "group_count", -1);

      evictTypeFields(cache, {
        Audio: ["groups"],
        Performer: ["group_count"],
        Studio: ["group_count"],
      });
      evictQueries(cache, [
        ...groupMutationImpactedQueries,
        GQL.FindAudiosDocument, // filter by group
      ]);
    },
  });

export const useGroupsDestroy = (input: GQL.GroupsDestroyMutationVariables) =>
  GQL.useGroupsDestroyMutation({
    variables: input,
    update(cache, result) {
      if (!result.data?.groupsDestroy) return;

      const { ids } = input;

      for (const id of ids) {
        const obj = { __typename: "Group", id };
        deleteObject(cache, obj, GQL.FindGroupDocument);
      }

      // update stats
      updateStats(cache, "group_count", -ids.length);

      evictTypeFields(cache, {
        Audio: ["groups"],
        Performer: ["group_count"],
        Studio: ["group_count"],
      });
      evictQueries(cache, [
        ...groupMutationImpactedQueries,
        GQL.FindAudiosDocument, // filter by group
      ]);
    },
  });

export function useReorderSubGroupsMutation() {
  return GQL.useReorderSubGroupsMutation({
    update(cache) {
      evictQueries(cache, [
        GQL.FindGroupsDocument, // various filters
      ]);
    },
  });
}

export const useAddSubGroups = () => {
  const [addSubGroups] = GQL.useAddGroupSubGroupsMutation({
    update(cache, result) {
      if (!result.data?.addGroupSubGroups) return;

      evictTypeFields(cache, groupMutationImpactedTypeFields);
      evictQueries(cache, groupMutationImpactedQueries);
    },
  });

  return (containingGroupId: string, toAdd: GQL.GroupDescriptionInput[]) => {
    return addSubGroups({
      variables: {
        input: {
          containing_group_id: containingGroupId,
          sub_groups: toAdd,
        },
      },
    });
  };
};

export const useRemoveSubGroups = () => {
  const [removeSubGroups] = GQL.useRemoveGroupSubGroupsMutation({
    update(cache, result) {
      if (!result.data?.removeGroupSubGroups) return;

      evictTypeFields(cache, groupMutationImpactedTypeFields);
      evictQueries(cache, groupMutationImpactedQueries);
    },
  });

  return (containingGroupId: string, removeIds: string[]) => {
    return removeSubGroups({
      variables: {
        input: {
          containing_group_id: containingGroupId,
          sub_group_ids: removeIds,
        },
      },
    });
  };
};

const performerMutationImpactedTypeFields = {
  Tag: ["performer_count"],
};

export const performerMutationImpactedQueries = [
  GQL.FindAudiosDocument, // filter by performer tags
  GQL.FindPerformersDocument, // various filters
  GQL.FindTagsDocument, // filter by performer count
];

export const usePerformerCreate = () =>
  GQL.usePerformerCreateMutation({
    update(cache, result) {
      const performer = result.data?.performerCreate;
      if (!performer) return;

      // update stats
      updateStats(cache, "performer_count", 1);

      evictTypeFields(cache, performerMutationImpactedTypeFields);
      evictQueries(cache, [
        GQL.FindPerformersDocument, // various filters
        GQL.FindTagsDocument, // filter by performer count
      ]);
    },
  });

export const usePerformerUpdate = () =>
  GQL.usePerformerUpdateMutation({
    update(cache, result) {
      if (!result.data?.performerUpdate) return;

      evictTypeFields(cache, performerMutationImpactedTypeFields);
      evictQueries(cache, performerMutationImpactedQueries);
    },
  });

export const useBulkPerformerUpdate = (input: GQL.BulkPerformerUpdateInput) =>
  GQL.useBulkPerformerUpdateMutation({
    variables: { input },
    update(cache, result) {
      if (!result.data?.bulkPerformerUpdate) return;

      evictTypeFields(cache, performerMutationImpactedTypeFields);
      evictQueries(cache, performerMutationImpactedQueries);
    },
  });

export const usePerformerDestroy = () =>
  GQL.usePerformerDestroyMutation({
    update(cache, result, { variables }) {
      if (!result.data?.performerDestroy || !variables) return;

      const obj = { __typename: "Performer", id: variables.id };
      deleteObject(cache, obj, GQL.FindPerformerDocument);

      // update stats
      updateStats(cache, "performer_count", -1);

      evictTypeFields(cache, {
        ...performerMutationImpactedTypeFields,
        Performer: ["performer_count"],
        Studio: ["performer_count"],
      });
      evictQueries(cache, [
        ...performerMutationImpactedQueries,
        GQL.FindGroupsDocument, // filter by performers
      ]);
    },
  });

export const usePerformersDestroy = (
  input: GQL.PerformersDestroyMutationVariables
) =>
  GQL.usePerformersDestroyMutation({
    variables: input,
    update(cache, result) {
      if (!result.data?.performersDestroy) return;

      const { ids } = input;

      let count: number;
      if (Array.isArray(ids)) {
        for (const id of ids) {
          const obj = { __typename: "Performer", id };
          deleteObject(cache, obj, GQL.FindPerformerDocument);
        }
        count = ids.length;
      } else {
        const obj = { __typename: "Performer", id: ids };
        deleteObject(cache, obj, GQL.FindPerformerDocument);
        count = 1;
      }

      // update stats
      updateStats(cache, "performer_count", -count);

      evictTypeFields(cache, {
        ...performerMutationImpactedTypeFields,
        Performer: ["performer_count"],
        Studio: ["performer_count"],
      });
      evictQueries(cache, [
        ...performerMutationImpactedQueries,
        GQL.FindGroupsDocument, // filter by performers
      ]);
    },
  });

export const mutatePerformerMerge = (
  destination: string,
  source: string[],
  values: GQL.PerformerUpdateInput
) =>
  client.mutate<GQL.PerformerMergeMutation>({
    mutation: GQL.PerformerMergeDocument,
    variables: {
      input: {
        source,
        destination,
        values,
      },
    },
    update(cache, result) {
      if (!result.data?.performerMerge) return;

      for (const id of source) {
        const obj = { __typename: "Performer", id };
        deleteObject(cache, obj, GQL.FindPerformerDocument);
      }

      cache.evict({
        id: cache.identify({ __typename: "Performer", id: destination }),
      });

      evictTypeFields(cache, performerMutationImpactedTypeFields);
      evictQueries(cache, [
        ...performerMutationImpactedQueries,
        GQL.FindGroupsDocument, // filter by performers
        GQL.StatsDocument, // performer count
      ]);
    },
  });

const studioMutationImpactedTypeFields = {
  Studio: ["child_studios"],
};

export const studioMutationImpactedQueries = [
  GQL.FindAudiosDocument, // filter by studio
  GQL.FindGroupsDocument, // filter by studio
  GQL.FindPerformersDocument, // filter by studio
  GQL.FindStudiosDocument, // various filters
];

export const useStudioCreate = () =>
  GQL.useStudioCreateMutation({
    update(cache, result, { variables }) {
      const studio = result.data?.studioCreate;
      if (!studio || !variables) return;

      // update stats
      updateStats(cache, "studio_count", 1);

      // if new scene has a parent studio,
      // refetch the parent's list of child studios
      const { parent_id } = variables.input;
      if (parent_id !== undefined) {
        cache.evict({
          id: cache.identify({ __typename: "Studio", id: parent_id }),
          fieldName: "child_studios",
        });
      }

      evictQueries(cache, [
        GQL.FindStudiosDocument, // various filters
      ]);
    },
  });

export const useStudioUpdate = () =>
  GQL.useStudioUpdateMutation({
    update(cache, result) {
      const studio = result.data?.studioUpdate;
      if (!studio) return;

      const obj = { __typename: "Studio", id: studio.id };
      evictTypeFields(
        cache,
        studioMutationImpactedTypeFields,
        cache.identify(obj) // don't evict this studio
      );

      evictQueries(cache, studioMutationImpactedQueries);
    },
  });

export const useBulkStudioUpdate = () =>
  GQL.useBulkStudioUpdateMutation({
    update(cache, result) {
      if (!result.data?.bulkStudioUpdate) return;

      evictTypeFields(cache, studioMutationImpactedTypeFields);
      evictQueries(cache, studioMutationImpactedQueries);
    },
  });

export const useStudioDestroy = (input: GQL.StudioDestroyInput) =>
  GQL.useStudioDestroyMutation({
    variables: input,
    update(cache, result) {
      if (!result.data?.studioDestroy) return;

      const obj = { __typename: "Studio", id: input.id };
      deleteObject(cache, obj, GQL.FindStudioDocument);

      // update stats
      updateStats(cache, "studio_count", -1);

      evictTypeFields(cache, studioMutationImpactedTypeFields);
      evictQueries(cache, studioMutationImpactedQueries);
    },
  });

export const useStudiosDestroy = (input: GQL.StudiosDestroyMutationVariables) =>
  GQL.useStudiosDestroyMutation({
    variables: input,
    update(cache, result) {
      if (!result.data?.studiosDestroy) return;

      const { ids } = input;

      for (const id of ids) {
        const obj = { __typename: "Studio", id };
        deleteObject(cache, obj, GQL.FindStudioDocument);
      }

      // update stats
      updateStats(cache, "studio_count", -ids.length);

      evictTypeFields(cache, studioMutationImpactedTypeFields);
      evictQueries(cache, studioMutationImpactedQueries);
    },
  });

const tagMutationImpactedTypeFields = {
  Tag: ["parents", "children"],
};

const tagMutationImpactedQueries = [
  GQL.FindGroupsDocument, // filter by tags
  GQL.FindAudiosDocument, // filter by tags
  GQL.FindPerformersDocument, // filter by tags
  GQL.FindTagsDocument, // various filters
];

export const useTagCreate = () =>
  GQL.useTagCreateMutation({
    update(cache, result) {
      const tag = result.data?.tagCreate;
      if (!tag) return;

      // update stats
      updateStats(cache, "tag_count", 1);

      const obj = { __typename: "Tag", id: tag.id };
      evictTypeFields(
        cache,
        tagMutationImpactedTypeFields,
        cache.identify(obj) // don't evict this tag
      );

      evictQueries(cache, [
        GQL.FindTagsDocument, // various filters
      ]);
    },
  });

export const useTagUpdate = () =>
  GQL.useTagUpdateMutation({
    update(cache, result) {
      const tag = result.data?.tagUpdate;
      if (!tag) return;

      const obj = { __typename: "Tag", id: tag.id };
      evictTypeFields(
        cache,
        tagMutationImpactedTypeFields,
        cache.identify(obj) // don't evict this tag
      );

      evictQueries(cache, tagMutationImpactedQueries);
    },
  });

export const useBulkTagUpdate = (input: GQL.BulkTagUpdateInput) =>
  GQL.useBulkTagUpdateMutation({
    variables: { input },
    update(cache, result) {
      if (!result.data?.bulkTagUpdate) return;

      evictTypeFields(cache, tagMutationImpactedTypeFields);
      evictQueries(cache, tagMutationImpactedQueries);
    },
  });

export const useTagDestroy = (input: GQL.TagDestroyInput) =>
  GQL.useTagDestroyMutation({
    variables: input,
    update(cache, result) {
      if (!result.data?.tagDestroy) return;

      const obj = { __typename: "Tag", id: input.id };
      deleteObject(cache, obj, GQL.FindTagDocument);

      // update stats
      updateStats(cache, "tag_count", -1);

      evictTypeFields(cache, tagMutationImpactedTypeFields);
      evictQueries(cache, tagMutationImpactedQueries);
    },
  });

export const useTagsDestroy = (input: GQL.TagsDestroyMutationVariables) =>
  GQL.useTagsDestroyMutation({
    variables: input,
    update(cache, result) {
      if (!result.data?.tagsDestroy) return;

      const { ids } = input;

      for (const id of ids) {
        const obj = { __typename: "Tag", id };
        deleteObject(cache, obj, GQL.FindTagDocument);
      }

      // update stats
      updateStats(cache, "tag_count", -ids.length);

      evictTypeFields(cache, tagMutationImpactedTypeFields);
      evictQueries(cache, tagMutationImpactedQueries);
    },
  });

export const useTagsMerge = () =>
  GQL.useTagsMergeMutation({
    update(cache, result, { variables }) {
      if (!result.data?.tagsMerge || !variables) return;

      const { source, destination } = variables;

      for (const id of source) {
        const obj = { __typename: "Tag", id };
        deleteObject(cache, obj, GQL.FindTagDocument);
      }

      cache.evict({
        id: cache.identify({ __typename: "Tag", id: destination }),
      });

      evictQueries(cache, [
        ...tagMutationImpactedQueries,
        GQL.StatsDocument, // tag count
      ]);
    },
  });

export const useSaveFilter = () => {
  const [saveFilterMutation] = GQL.useSaveFilterMutation({
    update(cache, result) {
      if (!result.data?.saveFilter) return;

      evictQueries(cache, [GQL.FindSavedFiltersDocument]);
    },
  });

  function saveFilter(filter: ListFilterModel, name: string, id?: string) {
    const filterCopy = filter.clone();

    return saveFilterMutation({
      variables: {
        input: {
          id,
          mode: filter.mode,
          name,
          find_filter: filterCopy.makeFindFilter(),
          object_filter: filterCopy.makeSavedFilter(),
          ui_options: filterCopy.makeSavedUIOptions(),
        },
      },
    });
  }

  return saveFilter;
};

export const useSavedFilterDestroy = () =>
  GQL.useDestroySavedFilterMutation({
    update(cache, result, { variables }) {
      if (!result.data?.destroySavedFilter || !variables) return;

      const obj = { __typename: "SavedFilter", id: variables.input.id };
      deleteObject(cache, obj, GQL.FindSavedFilterDocument);
    },
  });

export const mutateDeleteFiles = (ids: string[]) =>
  client.mutate<GQL.DeleteFilesMutation>({
    mutation: GQL.DeleteFilesDocument,
    variables: { ids },
    update(cache, result) {
      if (!result.data?.deleteFiles) return;

      // we don't know which type the files are,
      // so evict all of them
      for (const id of ids) {
        cache.evict({
          id: cache.identify({ __typename: "AudioFile", id }),
        });
      }

      evictQueries(cache, [
        GQL.FindAudiosDocument, // filter by file count
        GQL.StatsDocument, // audios size
      ]);
    },
  });

export const mutateRevealFileInFileManager = (id: string) =>
  client.mutate<GQL.RevealFileInFileManagerMutation>({
    mutation: GQL.RevealFileInFileManagerDocument,
    variables: { id },
  });

export const mutateRevealFolderInFileManager = (id: string) =>
  client.mutate<GQL.RevealFolderInFileManagerMutation>({
    mutation: GQL.RevealFolderInFileManagerDocument,
    variables: { id },
  });

/// Scrapers

export const useListPerformerScrapers = () =>
  GQL.useListPerformerScrapersQuery();

export const useScrapePerformerList = (scraperId: string, q: string) =>
  GQL.useScrapeSinglePerformerQuery({
    variables: {
      source: {
        scraper_id: scraperId,
      },
      input: {
        query: q,
      },
    },
    skip: q === "",
  });

export const queryScrapePerformer = (
  scraperId: string,
  scrapedPerformer: GQL.ScrapedPerformerInput
) =>
  client.query<GQL.ScrapeSinglePerformerQuery>({
    query: GQL.ScrapeSinglePerformerDocument,
    variables: {
      source: {
        scraper_id: scraperId,
      },
      input: {
        performer_input: scrapedPerformer,
      },
    },
    fetchPolicy: "network-only",
  });

export const queryScrapePerformerURL = (url: string) =>
  client.query<GQL.ScrapePerformerUrlQuery>({
    query: GQL.ScrapePerformerUrlDocument,
    variables: { url },
    fetchPolicy: "network-only",
  });

export const stashBoxPerformerQuery = (
  searchVal: string,
  stashBoxEndpoint: string
) =>
  client.query<
    GQL.ScrapeSinglePerformerQuery,
    GQL.ScrapeSinglePerformerQueryVariables
  >({
    query: GQL.ScrapeSinglePerformerDocument,
    variables: {
      source: {
        stash_box_endpoint: stashBoxEndpoint,
      },
      input: {
        query: searchVal,
      },
    },
    fetchPolicy: "network-only",
  });

export const stashBoxStudioQuery = (
  query: string | null,
  stashBoxEndpoint: string
) =>
  client.query<
    GQL.ScrapeSingleStudioQuery,
    GQL.ScrapeSingleStudioQueryVariables
  >({
    query: GQL.ScrapeSingleStudioDocument,
    variables: {
      source: {
        stash_box_endpoint: stashBoxEndpoint,
      },
      input: {
        query: query,
      },
    },
    fetchPolicy: "network-only",
  });

export const stashBoxTagQuery = (
  query: string | null,
  stashBoxEndpoint: string
) =>
  client.query<GQL.ScrapeSingleTagQuery, GQL.ScrapeSingleTagQueryVariables>({
    query: GQL.ScrapeSingleTagDocument,
    variables: {
      source: {
        stash_box_endpoint: stashBoxEndpoint,
      },
      input: {
        query: query,
      },
    },
    fetchPolicy: "network-only",
  });

export const mutateStashBoxBatchPerformerTag = (
  input: GQL.StashBoxBatchTagInput
) =>
  client.mutate<GQL.StashBoxBatchPerformerTagMutation>({
    mutation: GQL.StashBoxBatchPerformerTagDocument,
    variables: { input },
  });

export const mutateStashBoxBatchStudioTag = (
  input: GQL.StashBoxBatchTagInput
) =>
  client.mutate<GQL.StashBoxBatchStudioTagMutation>({
    mutation: GQL.StashBoxBatchStudioTagDocument,
    variables: { input },
  });

export const mutateStashBoxBatchTagTag = (input: GQL.StashBoxBatchTagInput) =>
  client.mutate<GQL.StashBoxBatchTagTagMutation>({
    mutation: GQL.StashBoxBatchTagTagDocument,
    variables: { input },
  });

export const useListGroupScrapers = () => GQL.useListGroupScrapersQuery();

export const queryScrapeGroupURL = (url: string) =>
  client.query<GQL.ScrapeGroupUrlQuery>({
    query: GQL.ScrapeGroupUrlDocument,
    variables: { url },
    fetchPolicy: "network-only",
  });

export const mutateSubmitStashBoxPerformerDraft = (
  input: GQL.StashBoxDraftSubmissionInput
) =>
  client.mutate<GQL.SubmitStashBoxPerformerDraftMutation>({
    mutation: GQL.SubmitStashBoxPerformerDraftDocument,
    variables: { input },
  });

/// Configuration

export const useConfiguration = () => GQL.useConfigurationQuery();

export const usePlugins = () => GQL.usePluginsQuery();

export const usePluginTasks = () => GQL.usePluginTasksQuery();

export const useStats = () => GQL.useStatsQuery();

export const useVersion = () => GQL.useVersionQuery();

export const useLatestVersion = () =>
  GQL.useLatestVersionQuery({
    notifyOnNetworkStatusChange: true,
    errorPolicy: "ignore",
  });

export const useJobQueue = () =>
  GQL.useJobQueueQuery({
    fetchPolicy: "no-cache",
  });

export const useLogs = () =>
  GQL.useLogsQuery({
    fetchPolicy: "no-cache",
  });

export const queryLogs = () =>
  client.query<GQL.LogsQuery>({
    query: GQL.LogsDocument,
    fetchPolicy: "no-cache",
  });

export const useSystemStatus = () => GQL.useSystemStatusQuery();
export const refetchSystemStatus = () => {
  client.refetchQueries({
    include: [GQL.SystemStatusDocument],
  });
};

export const useJobsSubscribe = () => GQL.useJobsSubscribeSubscription();

export const useLoggingSubscribe = () => GQL.useLoggingSubscribeSubscription();

// all scraper-related queries
export const scraperMutationImpactedQueries = [
  GQL.ListGroupScrapersDocument,
  GQL.ListPerformerScrapersDocument,
];

export const mutateReloadScrapers = () =>
  client.mutate<GQL.ReloadScrapersMutation>({
    mutation: GQL.ReloadScrapersDocument,
    update(cache, result) {
      if (!result.data?.reloadScrapers) return;

      evictQueries(cache, scraperMutationImpactedQueries);
    },
  });

// all plugin-related queries
export const pluginMutationImpactedQueries = [
  GQL.PluginsDocument,
  GQL.PluginTasksDocument,
  GQL.InstalledPluginPackagesDocument,
  GQL.InstalledPluginPackagesStatusDocument,
];

export const mutateReloadPlugins = () =>
  client.mutate<GQL.ReloadPluginsMutation>({
    mutation: GQL.ReloadPluginsDocument,
    update(cache, result) {
      if (!result.data?.reloadPlugins) return;

      evictQueries(cache, pluginMutationImpactedQueries);
    },
  });

type BoolMap = { [key: string]: boolean };

export const mutateSetPluginsEnabled = (enabledMap: BoolMap) =>
  client.mutate<GQL.SetPluginsEnabledMutation>({
    mutation: GQL.SetPluginsEnabledDocument,
    variables: { enabledMap },
    update(cache, result) {
      if (!result.data?.setPluginsEnabled) return;

      for (const id in enabledMap) {
        cache.modify({
          id: cache.identify({ __typename: "Plugin", id }),
          fields: {
            enabled() {
              return enabledMap[id];
            },
          },
        });
      }
    },
  });

function updateConfiguration(cache: ApolloCache<unknown>, result: FetchResult) {
  if (!result.data) return;

  evictQueries(cache, [GQL.ConfigurationDocument]);
}

export const useConfigureGeneral = () =>
  GQL.useConfigureGeneralMutation({
    update(cache, result) {
      if (!result.data?.configureGeneral) return;

      evictQueries(cache, [
        GQL.ConfigurationDocument,
        ...scraperMutationImpactedQueries,
        ...pluginMutationImpactedQueries,
      ]);
    },
  });

export const useConfigureInterface = () =>
  GQL.useConfigureInterfaceMutation({
    update: updateConfiguration,
  });

export const useGenerateAPIKey = () =>
  GQL.useGenerateApiKeyMutation({
    update: updateConfiguration,
  });

export const useConfigureDefaults = () =>
  GQL.useConfigureDefaultsMutation({
    update: updateConfiguration,
  });

function updateUIConfig(
  cache: ApolloCache<Record<string, StoreObject>>,
  result: GQL.ConfigureUiMutation["configureUI"] | undefined
) {
  if (!result) return;

  const existing = cache.readQuery<GQL.ConfigurationQuery>({
    query: GQL.ConfigurationDocument,
  });

  cache.writeQuery({
    query: GQL.ConfigurationDocument,
    data: {
      configuration: {
        ...existing?.configuration,
        ui: result,
      },
    },
  });
}

export const useConfigureUI = () =>
  GQL.useConfigureUiMutation({
    update: (cache, result) => updateUIConfig(cache, result.data?.configureUI),
  });

export const useConfigureUISetting = () =>
  GQL.useConfigureUiSettingMutation({
    update: (cache, result) =>
      updateUIConfig(cache, result.data?.configureUISetting),
  });

export const useConfigureScraping = () =>
  GQL.useConfigureScrapingMutation({
    update: updateConfiguration,
  });

export const useConfigureDLNA = () =>
  GQL.useConfigureDlnaMutation({
    update: updateConfiguration,
  });

export const useConfigurePlugin = () =>
  GQL.useConfigurePluginMutation({
    update: updateConfiguration,
  });

export const mutateStopJob = (jobID: string) =>
  client.mutate<GQL.StopJobMutation>({
    mutation: GQL.StopJobDocument,
    variables: { job_id: jobID },
  });

const setupMutationImpactedQueries = [
  GQL.ConfigurationDocument,
  GQL.SystemStatusDocument,
];

export const mutateSetup = (input: GQL.SetupInput) =>
  client.mutate<GQL.SetupMutation>({
    mutation: GQL.SetupDocument,
    variables: { input },
    update(cache, result) {
      if (!result.data?.setup) return;

      evictQueries(cache, setupMutationImpactedQueries);
    },
  });

export const mutateMigrate = (input: GQL.MigrateInput) =>
  client.mutate<GQL.MigrateMutation>({
    mutation: GQL.MigrateDocument,
    variables: { input },
  });

// migrate now runs asynchronously, so we need to evict queries
// once it successfully completes
export function postMigrate() {
  evictQueries(clientCache, setupMutationImpactedQueries);
}

/// Packages

// Acts like GQL.useInstalledScraperPackagesStatusQuery if loadUpgrades is true,
// and GQL.useInstalledScraperPackagesQuery if it is false
export const useInstalledScraperPackages = <T extends boolean>(
  loadUpgrades: T
) => {
  const query = loadUpgrades
    ? GQL.InstalledScraperPackagesStatusDocument
    : GQL.InstalledScraperPackagesDocument;

  type TData = T extends true
    ? GQL.InstalledScraperPackagesStatusQuery
    : GQL.InstalledScraperPackagesQuery;
  type TVariables = T extends true
    ? GQL.InstalledScraperPackagesStatusQueryVariables
    : GQL.InstalledScraperPackagesQueryVariables;

  return useQuery<TData, TVariables>(query);
};

export const queryAvailableScraperPackages = (source: string) =>
  client.query<GQL.AvailableScraperPackagesQuery>({
    query: GQL.AvailableScraperPackagesDocument,
    variables: {
      source,
    },
    fetchPolicy: "network-only",
  });

export const mutateInstallScraperPackages = (
  packages: GQL.PackageSpecInput[]
) =>
  client.mutate<GQL.InstallScraperPackagesMutation>({
    mutation: GQL.InstallScraperPackagesDocument,
    variables: {
      packages,
    },
  });

export const mutateUpdateScraperPackages = (packages: GQL.PackageSpecInput[]) =>
  client.mutate<GQL.UpdateScraperPackagesMutation>({
    mutation: GQL.UpdateScraperPackagesDocument,
    variables: {
      packages,
    },
  });

export const mutateUninstallScraperPackages = (
  packages: GQL.PackageSpecInput[]
) =>
  client.mutate<GQL.UninstallScraperPackagesMutation>({
    mutation: GQL.UninstallScraperPackagesDocument,
    variables: {
      packages,
    },
  });

// Acts like GQL.useInstalledPluginPackagesStatusQuery if loadUpgrades is true,
// and GQL.useInstalledPluginPackagesQuery if it is false
export const useInstalledPluginPackages = <T extends boolean>(
  loadUpgrades: T
) => {
  const query = loadUpgrades
    ? GQL.InstalledPluginPackagesStatusDocument
    : GQL.InstalledPluginPackagesDocument;

  type TData = T extends true
    ? GQL.InstalledPluginPackagesStatusQuery
    : GQL.InstalledPluginPackagesQuery;
  type TVariables = T extends true
    ? GQL.InstalledPluginPackagesStatusQueryVariables
    : GQL.InstalledPluginPackagesQueryVariables;

  return useQuery<TData, TVariables>(query);
};

export const queryAvailablePluginPackages = (source: string) =>
  client.query<GQL.AvailablePluginPackagesQuery>({
    query: GQL.AvailablePluginPackagesDocument,
    variables: {
      source,
    },
    fetchPolicy: "network-only",
  });

export const mutateInstallPluginPackages = (packages: GQL.PackageSpecInput[]) =>
  client.mutate<GQL.InstallPluginPackagesMutation>({
    mutation: GQL.InstallPluginPackagesDocument,
    variables: {
      packages,
    },
  });

export const mutateUpdatePluginPackages = (packages: GQL.PackageSpecInput[]) =>
  client.mutate<GQL.UpdatePluginPackagesMutation>({
    mutation: GQL.UpdatePluginPackagesDocument,
    variables: {
      packages,
    },
  });

export const mutateUninstallPluginPackages = (
  packages: GQL.PackageSpecInput[]
) =>
  client.mutate<GQL.UninstallPluginPackagesMutation>({
    mutation: GQL.UninstallPluginPackagesDocument,
    variables: {
      packages,
    },
  });

/// Tasks

export const mutateMetadataScan = (input: GQL.ScanMetadataInput) =>
  client.mutate<GQL.MetadataScanMutation>({
    mutation: GQL.MetadataScanDocument,
    variables: { input },
  });

export const mutateMetadataIdentify = (input: GQL.IdentifyMetadataInput) =>
  client.mutate<GQL.MetadataIdentifyMutation>({
    mutation: GQL.MetadataIdentifyDocument,
    variables: { input },
  });

export const mutateMetadataAutoTag = (input: GQL.AutoTagMetadataInput) =>
  client.mutate<GQL.MetadataAutoTagMutation>({
    mutation: GQL.MetadataAutoTagDocument,
    variables: { input },
  });

export const mutateMetadataGenerate = (input: GQL.GenerateMetadataInput) =>
  client.mutate<GQL.MetadataGenerateMutation>({
    mutation: GQL.MetadataGenerateDocument,
    variables: { input },
  });

export const mutateMetadataClean = (input: GQL.CleanMetadataInput) =>
  client.mutate<GQL.MetadataCleanMutation>({
    mutation: GQL.MetadataCleanDocument,
    variables: { input },
  });

export const mutateCleanGenerated = (input: GQL.CleanGeneratedInput) =>
  client.mutate<GQL.MetadataCleanGeneratedMutation>({
    mutation: GQL.MetadataCleanGeneratedDocument,
    variables: { input },
  });

export const mutateRunPluginTask = (
  pluginId: string,
  taskName: string,
  args?: GQL.Scalars["Map"]["input"]
) =>
  client.mutate<GQL.RunPluginTaskMutation>({
    mutation: GQL.RunPluginTaskDocument,
    variables: { plugin_id: pluginId, task_name: taskName, args },
  });

export const mutateMetadataExport = () =>
  client.mutate<GQL.MetadataExportMutation>({
    mutation: GQL.MetadataExportDocument,
  });

export const mutateExportObjects = (input: GQL.ExportObjectsInput) =>
  client.mutate<GQL.ExportObjectsMutation>({
    mutation: GQL.ExportObjectsDocument,
    variables: { input },
  });

export const mutateMetadataImport = () =>
  client.mutate<GQL.MetadataImportMutation>({
    mutation: GQL.MetadataImportDocument,
  });

export const mutateImportObjects = (input: GQL.ImportObjectsInput) =>
  client.mutate<GQL.ImportObjectsMutation>({
    mutation: GQL.ImportObjectsDocument,
    variables: { input },
  });

export const mutateBackupDatabase = (input: GQL.BackupDatabaseInput) =>
  client.mutate<GQL.BackupDatabaseMutation>({
    mutation: GQL.BackupDatabaseDocument,
    variables: { input },
  });

export const mutateAnonymiseDatabase = (input: GQL.AnonymiseDatabaseInput) =>
  client.mutate<GQL.AnonymiseDatabaseMutation>({
    mutation: GQL.AnonymiseDatabaseDocument,
    variables: { input },
  });

export const mutateOptimiseDatabase = () =>
  client.mutate<GQL.OptimiseDatabaseMutation>({
    mutation: GQL.OptimiseDatabaseDocument,
  });

export const mutateMigrateBlobs = (input: GQL.MigrateBlobsInput) =>
  client.mutate<GQL.MigrateBlobsMutation>({
    mutation: GQL.MigrateBlobsDocument,
    variables: { input },
  });

/// Misc

export const useDirectory = (path?: string) =>
  GQL.useDirectoryQuery({ variables: { path } });

