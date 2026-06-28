import { useCallback, useEffect } from "react";
import { IState, useLightboxContext } from "./context";
import { IChapter } from "./types";

export const useLightbox = (
  state: Partial<Omit<IState, "isVisible">> = {},
  chapters: IChapter[] = []
) => {
  const { setLightboxState } = useLightboxContext();

  useEffect(() => {
    setLightboxState({
      images: state.images,
      showNavigation: state.showNavigation,
      pageCallback: state.pageCallback,
      page: state.page,
      pages: state.pages,
      pageSize: state.pageSize,
      slideshowEnabled: state.slideshowEnabled,
      onClose: state.onClose,
    });
  }, [
    setLightboxState,
    state.images,
    state.showNavigation,
    state.pageCallback,
    state.page,
    state.pages,
    state.pageSize,
    state.slideshowEnabled,
    state.onClose,
  ]);

  const show = useCallback(
    (props: Partial<IState>) => {
      setLightboxState({
        ...props,
        isVisible: true,
        page: props.page ?? state.page,
        pages: props.pages ?? state.pages,
        pageSize: props.pageSize ?? state.pageSize,
        chapters: chapters,
      });
    },
    [setLightboxState, state.page, state.pages, state.pageSize, chapters]
  );
  return show;
};
