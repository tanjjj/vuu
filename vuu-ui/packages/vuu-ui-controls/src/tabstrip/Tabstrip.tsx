import { asReactElements, useId } from "@vuu-ui/vuu-utils";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import cx from "clsx";
import React, { useMemo, useRef } from "react";
import { TabProps, TabstripProps } from "./TabsTypes";
import { useTabstrip } from "./useTabstrip";
import { IconButton } from "../icon-button";
import { OverflowContainer } from "../overflow-container";

import tabstripCss from "./Tabstrip.css";

const classBase = "vuuTabstrip";

export const Tabstrip = ({
  activeTabIndex: activeTabIndexProp,
  allowAddTab,
  allowCloseTab,
  allowDragDrop = false,
  allowRenameTab = false,
  animateSelectionThumb = false,
  children,
  className: classNameProp,
  id: idProp,
  keyBoardActivation = "manual",
  location,
  onActiveChange,
  onAddTab,
  onCloseTab,
  onExitEditMode,
  onMoveTab,
  orientation = "horizontal",
  showTabMenuButton,
  style: styleProp,
  tabClassName,
  variant = "secondary",
  ...htmlAttributes
}: TabstripProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "vuu-tabstrip",
    css: tabstripCss,
    window: targetWindow,
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const {
    activeTabIndex,
    containerStyle,
    focusVisible,
    draggedItemIndex,
    onClickAddTab,
    interactedTabState,
    tabProps,
    ...tabstripHook
  } = useTabstrip({
    activeTabIndex: activeTabIndexProp,
    allowDragDrop,
    animateSelectionThumb,
    containerRef: rootRef,
    keyBoardActivation,
    onActiveChange,
    onAddTab,
    onCloseTab,
    onExitEditMode,
    onMoveTab,
    orientation,
  });
  const id = useId(idProp);
  const className = cx(classBase, classNameProp);
  const style =
    styleProp || containerStyle
      ? {
          ...styleProp,
          ...containerStyle,
        }
      : undefined;

  const tabs = useMemo(
    () =>
      asReactElements(children)
        .map((child, index) => {
          const {
            id: tabId = `${id}-tab-${index}`,
            className,
            closeable = allowCloseTab,
            editable = allowRenameTab,
            location: tabLocation,
            showMenuButton = showTabMenuButton,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } = child.props as any;
          const selected = index === activeTabIndex;
          return React.cloneElement(child, {
            ...tabProps,
            ...tabstripHook.navigationProps,
            className: cx(className, tabClassName),
            closeable,
            "data-overflow-priority": selected ? "1" : undefined,
            dragging: draggedItemIndex === index,
            editable,
            editing: interactedTabState?.index === index,
            focusVisible: focusVisible === index,
            id: tabId,
            index,
            key: index,
            location: cx(location, tabLocation),
            selected,
            showMenuButton,
            tabIndex: selected ? 0 : -1,
          } as Partial<TabProps>);
        })
        .concat(
          allowAddTab ? (
            <IconButton
              {...tabstripHook.navigationProps}
              aria-label="Create Tab"
              className={`${classBase}-addTabButton`}
              data-embedded
              icon="add"
              data-overflow-priority="1"
              key="addButton"
              onClick={onClickAddTab}
              variant="secondary"
              tabIndex={-1}
            />
          ) : (
            []
          ),
        ),
    [
      children,
      allowAddTab,
      tabstripHook.navigationProps,
      onClickAddTab,
      id,
      allowCloseTab,
      allowRenameTab,
      showTabMenuButton,
      activeTabIndex,
      tabProps,
      tabClassName,
      draggedItemIndex,
      interactedTabState,
      focusVisible,
      location,
    ],
  );

  return (
    <>
      <OverflowContainer
        {...htmlAttributes}
        {...tabstripHook.containerProps}
        className={cx(className, `${classBase}-${variant}`)}
        id={id}
        orientation={orientation}
        overflowIcon="more-horiz"
        ref={rootRef}
        style={style}
        role="tablist"
      >
        {tabs}
      </OverflowContainer>
      {tabstripHook.draggable}
    </>
  );
};
