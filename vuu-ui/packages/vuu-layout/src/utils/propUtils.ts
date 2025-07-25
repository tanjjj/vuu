import { ReactElement } from "react";
import { LayoutModel } from "@vuu-ui/vuu-utils";

const NO_PROPS = {};
export const getProp = (
  component: LayoutModel | undefined,
  propName: string,
) => {
  const props = getProps(component);
  return props[propName] ?? props[`data-${propName}`];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getProps = (component?: LayoutModel): any =>
  component?.props || component || NO_PROPS;

export const getChildProp = (container: LayoutModel) => {
  const props = getProps(container);
  if (props.children) {
    const {
      children: [target, ...rest],
    } = props;
    if (rest.length > 0) {
      console.warn(
        `getChild expected a single child, found ${rest.length + 1}`,
      );
    }
    return target as ReactElement;
  }
};
