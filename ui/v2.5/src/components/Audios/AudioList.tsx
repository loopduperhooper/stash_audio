import React, { useCallback, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router-dom";
import * as GQL from "src/core/generated-graphql";
import {
  queryFindAudios,
  useFindAudios,
  useFindAudiosMetadata,
} from "src/core/StashService";
import { useFilteredItemList } from "../List/ItemList";
import { ListFilterModel } from "src/models/list-filter/filter";
import { View } from "../List/views";
import { AudioCardGrid } from "./AudioCardGrid";
import {
  FilteredListToolbar,
  IItemListOperation,
} from "../List/FilteredListToolbar";
import { FileSize } from "../Shared/FileSize";
import { PatchComponent, PatchContainerComponent } from "src/patch";
import {
  Sidebar,
  SidebarPane,
  SidebarPaneContent,
  SidebarStateContext,
  useSidebarState,
} from "../Shared/Sidebar";
import { useCloseEditDelete, useFilterOperations } from "../List/util";
import {
  FilteredSidebarHeader,
  useFilteredSidebarKeybinds,
} from "../List/Filters/FilterSidebar";
import {
  IListFilterOperation,
  ListOperations,
} from "../List/ListOperationButtons";
import { FilterTags } from "../List/FilterTags";
import { Pagination, PaginationIndex } from "../List/Pagination";
import { LoadedContent } from "../List/PagedList";
import { SidebarStudiosFilter } from "../List/Filters/StudiosFilter";
import { SidebarPerformersFilter } from "../List/Filters/PerformersFilter";
import { SidebarTagsFilter } from "../List/Filters/TagsFilter";
import { SidebarRatingFilter } from "../List/Filters/RatingFilter";
import { SidebarBooleanFilter } from "../List/Filters/BooleanFilter";
import { OrganizedCriterionOption } from "src/models/list-filter/criteria/organized";
import { Button } from "react-bootstrap";
import useFocus from "src/utils/focus";
import cx from "classnames";

function renderMetadataByline(
  metadataInfo: GQL.FindAudiosMetadataQueryResult | undefined
) {
  const duration = metadataInfo?.data?.findAudios?.duration;
  const size = metadataInfo?.data?.findAudios?.filesize;

  if (metadataInfo?.loading) {
    return <span className="audios-stats">&nbsp;(...)</span>;
  }

  if (!duration && !size) {
    return;
  }

  const separator = duration && size ? " - " : "";

  return (
    <span className="audios-stats">
      &nbsp;(
      {duration ? (
        <span className="audios-duration">
          {Math.floor(duration / 3600)}h {Math.floor((duration % 3600) / 60)}m
        </span>
      ) : undefined}
      {separator}
      {size ? (
        <span className="audios-size">
          <FileSize size={size} />
        </span>
      ) : undefined}
      )
    </span>
  );
}

const AudioFilterSidebarSections = PatchContainerComponent(
  "FilteredAudioList.SidebarSections"
);

const SidebarContent: React.FC<{
  filter: ListFilterModel;
  setFilter: (filter: ListFilterModel) => void;
  filterHook?: (filter: ListFilterModel) => ListFilterModel;
  view?: View;
  sidebarOpen: boolean;
  onClose?: () => void;
  showEditFilter: (editingCriterion?: string) => void;
  count?: number;
  focus?: ReturnType<typeof useFocus>;
}> = ({
  filter,
  setFilter,
  filterHook,
  view,
  showEditFilter,
  sidebarOpen,
  onClose,
  count,
  focus,
}) => {
  const showResultsId =
    count !== undefined ? "actions.show_count_results" : "actions.show_results";

  return (
    <>
      <FilteredSidebarHeader
        sidebarOpen={sidebarOpen}
        showEditFilter={showEditFilter}
        filter={filter}
        setFilter={setFilter}
        view={view}
        focus={focus}
      />

      <AudioFilterSidebarSections>
        <SidebarStudiosFilter
          filter={filter}
          setFilter={setFilter}
          filterHook={filterHook}
        />
        <SidebarPerformersFilter
          filter={filter}
          setFilter={setFilter}
          filterHook={filterHook}
        />
        <SidebarTagsFilter
          filter={filter}
          setFilter={setFilter}
          filterHook={filterHook}
        />
        <SidebarRatingFilter filter={filter} setFilter={setFilter} />
        <SidebarBooleanFilter
          title={<FormattedMessage id="organized" />}
          data-type={OrganizedCriterionOption.type}
          option={OrganizedCriterionOption}
          filter={filter}
          setFilter={setFilter}
          sectionID="organized"
        />
      </AudioFilterSidebarSections>

      <div className="sidebar-footer">
        <Button className="sidebar-close-button" onClick={onClose}>
          <FormattedMessage id={showResultsId} values={{ count }} />
        </Button>
      </div>
    </>
  );
};

function useViewRandom(filter: ListFilterModel, count: number) {
  const history = useHistory();

  const viewRandom = useCallback(async () => {
    if (count === 0) {
      return;
    }

    const index = Math.floor(Math.random() * count);
    const filterCopy = new ListFilterModel(filter.mode, undefined, {
      defaultSortBy: filter.sortBy,
    });
    Object.assign(filterCopy, filter);
    filterCopy.itemsPerPage = 1;
    filterCopy.currentPage = index + 1;
    const singleResult = await queryFindAudios(filterCopy);
    if (singleResult.data.findAudios.audios.length === 1) {
      const { id } = singleResult.data.findAudios.audios[0];
      history.push(`/audios/${id}`);
    }
  }, [history, filter, count]);

  return viewRandom;
}

interface IAudioList {
  filterHook?: (filter: ListFilterModel) => ListFilterModel;
  view?: View;
  alterQuery?: boolean;
  extraOperations?: IItemListOperation<GQL.FindAudiosQueryResult>[];
}

export const FilteredAudioList = PatchComponent(
  "FilteredAudioList",
  (props: IAudioList) => {
    const intl = useIntl();

    const searchFocus = useFocus();

    const { filterHook, view, alterQuery, extraOperations: providedOperations = [] } = props;

    const {
      showSidebar,
      setShowSidebar,
      sectionOpen,
      setSectionOpen,
      loading: sidebarStateLoading,
    } = useSidebarState(view);

    const {
      filterState,
      queryResult,
      metadataInfo,
      modalState,
      listSelect,
      showEditFilter,
    } = useFilteredItemList({
      filterStateProps: {
        filterMode: GQL.FilterMode.Audios,
        view,
        useURL: alterQuery,
      },
      queryResultProps: {
        useResult: useFindAudios,
        useMetadataInfo: useFindAudiosMetadata,
        getCount: (r) => r.data?.findAudios.count ?? 0,
        getItems: (r) => r.data?.findAudios.audios ?? [],
        filterHook,
      },
    });

    const { filter, setFilter } = filterState;

    const { effectiveFilter, result, cachedResult, items, totalCount } =
      queryResult;

    const metadataByline = useMemo(() => {
      if (cachedResult.loading) return null;
      return renderMetadataByline(metadataInfo) ?? null;
    }, [cachedResult.loading, metadataInfo]);

    const {
      selectedIds,
      onSelectChange,
      onSelectAll,
      onSelectNone,
      onInvertSelection,
      hasSelection,
    } = listSelect;

    const { modal, closeModal } = modalState;

    const { setPage, removeCriterion, clearAllCriteria } = useFilterOperations({
      filter,
      setFilter,
    });

    useFilteredSidebarKeybinds({
      showSidebar,
      setShowSidebar,
    });

    const onCloseEditDelete = useCloseEditDelete({
      closeModal,
      onSelectNone,
      result,
    });

    const viewRandom = useViewRandom(effectiveFilter, totalCount);

    const convertedExtraOperations: IListFilterOperation[] =
      providedOperations.map((o) => ({
        ...o,
        isDisplayed: o.isDisplayed
          ? () => o.isDisplayed!(result, filter, selectedIds)
          : undefined,
        onClick: () => {
          o.onClick(result, filter, selectedIds);
        },
      }));

    const otherOperations: IListFilterOperation[] = [
      ...convertedExtraOperations,
      {
        text: intl.formatMessage({ id: "actions.select_all" }),
        onClick: () => onSelectAll(),
        isDisplayed: () => totalCount > 0,
      },
      {
        text: intl.formatMessage({ id: "actions.select_none" }),
        onClick: () => onSelectNone(),
        isDisplayed: () => hasSelection,
      },
      {
        text: intl.formatMessage({ id: "actions.invert_selection" }),
        onClick: () => onInvertSelection(),
        isDisplayed: () => totalCount > 0,
      },
      {
        text: intl.formatMessage({ id: "actions.view_random" }),
        onClick: viewRandom,
      },
    ];

    if (sidebarStateLoading) return null;

    const operations = (
      <ListOperations
        items={items.length}
        hasSelection={hasSelection}
        operations={otherOperations}
        operationsMenuClassName="audio-list-operations-dropdown"
      />
    );

    const pageCount = Math.ceil(totalCount / filter.itemsPerPage);

    const content = (
      <>
        <FilteredListToolbar
          filter={filter}
          listSelect={listSelect}
          setFilter={setFilter}
          showEditFilter={showEditFilter}
          operationComponent={operations}
          view={view}
          zoomable
        />

        <FilterTags
          criteria={filter.criteria}
          onEditCriterion={(c) => showEditFilter(c.criterionOption.type)}
          onRemoveCriterion={removeCriterion}
          onRemoveAll={clearAllCriteria}
        />

        <div className="pagination-index-container">
          <Pagination
            currentPage={filter.currentPage}
            itemsPerPage={filter.itemsPerPage}
            totalItems={totalCount}
            onChangePage={setPage}
          />
          <PaginationIndex
            loading={cachedResult.loading}
            itemsPerPage={filter.itemsPerPage}
            currentPage={filter.currentPage}
            totalItems={totalCount}
            metadataByline={metadataByline}
          />
        </div>

        <LoadedContent loading={result.loading} error={result.error}>
          <AudioCardGrid
            audios={items}
            selectedIds={selectedIds}
            zoomIndex={filter.zoomIndex}
            onSelectChange={onSelectChange}
          />
        </LoadedContent>

        {totalCount > filter.itemsPerPage && (
          <div className="pagination-footer-container">
            <div className="pagination-footer">
              <Pagination
                itemsPerPage={filter.itemsPerPage}
                currentPage={filter.currentPage}
                totalItems={totalCount}
                onChangePage={setPage}
                pagePopupPlacement="top"
                metadataByline={metadataByline}
              />
            </div>
          </div>
        )}
      </>
    );

    return (
      <>
        {modal}
        <div
          className={cx("item-list-container audio-list", {
            "hide-sidebar": !showSidebar,
          })}
        >
          <SidebarStateContext.Provider value={{ sectionOpen, setSectionOpen }}>
            <SidebarPane hideSidebar={!showSidebar}>
              <Sidebar
                hide={!showSidebar}
                onHide={() => setShowSidebar(false)}
              >
                <SidebarContent
                  filter={filter}
                  setFilter={setFilter}
                  filterHook={filterHook}
                  view={view}
                  showEditFilter={showEditFilter}
                  sidebarOpen={showSidebar}
                  onClose={() => setShowSidebar(false)}
                  count={cachedResult.loading ? undefined : totalCount}
                  focus={searchFocus}
                />
              </Sidebar>
              <SidebarPaneContent
                onSidebarToggle={() => setShowSidebar(!showSidebar)}
              >
                {content}
              </SidebarPaneContent>
            </SidebarPane>
          </SidebarStateContext.Provider>
        </div>
      </>
    );
  }
);
