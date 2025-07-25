import { VuuDataSourceProvider } from "@vuu-ui/vuu-data-react";
import { FlexboxLayout, StackLayout } from "@vuu-ui/vuu-layout";
import {
  FeatureAndLayoutProvider,
  LeftNav,
  LocalPersistenceManager,
  PersistenceProvider,
  SettingsSchema,
  Shell,
  ShellContextProvider,
  ShellLayoutProps,
} from "@vuu-ui/vuu-shell";
import {
  ColumnSettingsPanel,
  TableSettingsPanel,
} from "@vuu-ui/vuu-table-extras";
import { DragDropProvider } from "@vuu-ui/vuu-ui-controls";
import type { VuuUser } from "@vuu-ui/vuu-utils";
import {
  assertComponentsRegistered,
  registerComponent,
} from "@vuu-ui/vuu-utils";
import { useMemo } from "react";
import { getDefaultColumnConfig } from "./columnMetaData";
// import { useRpcResponseHandler } from "./useRpcResponseHandler";

import "./App.css";

registerComponent("ColumnSettings", ColumnSettingsPanel, "view");
registerComponent("TableSettings", TableSettingsPanel, "view");

assertComponentsRegistered([
  { componentName: "Flexbox", component: FlexboxLayout },
  { componentName: "Stack", component: StackLayout },
]);

const userSettingsSchema: SettingsSchema = {
  properties: [
    {
      name: "themeMode",
      label: "Mode",
      values: ["light", "dark"],
      defaultValue: "light",
      type: "string",
    },
    {
      name: "showAppStatusBar",
      label: "Show Application Status Bar",
      defaultValue: false,
      type: "boolean",
    },
  ],
};

const localPersistenceManager = new LocalPersistenceManager();

const defaultWebsocketUrl = (ssl: boolean) =>
  `${ssl ? "wss" : "ws"}://${location.hostname}:8090/websocket`;

const {
  ssl,
  websocketUrl: serverUrl = defaultWebsocketUrl(ssl),
  features,
} = await vuuConfig;

const dynamicFeatures = Object.values(features);

export const App = ({ user }: { user: VuuUser }) => {
  // this is causing full app re-render when tables are loaded
  // const { handleRpcResponse } = useRpcResponseHandler();

  const dragSource = useMemo(
    () => ({
      "basket-instruments": { dropTargets: "basket-constituents" },
    }),
    [],
  );

  const ShellLayoutProps = useMemo<ShellLayoutProps>(
    () => ({
      SidePanelProps: {
        children: <LeftNav />,
        sizeOpen: 240,
      },
      layoutTemplateId: "full-height",
    }),
    [],
  );

  return (
    <PersistenceProvider persistenceManager={localPersistenceManager}>
      <DragDropProvider dragSources={dragSource}>
        <ShellContextProvider value={{ getDefaultColumnConfig }}>
          <VuuDataSourceProvider>
            <FeatureAndLayoutProvider dynamicFeatures={dynamicFeatures}>
              <Shell
                shellLayoutProps={ShellLayoutProps}
                className="App"
                serverUrl={serverUrl}
                user={user}
                userSettingsSchema={userSettingsSchema}
              />
            </FeatureAndLayoutProvider>
          </VuuDataSourceProvider>
        </ShellContextProvider>
      </DragDropProvider>
    </PersistenceProvider>
  );
};
