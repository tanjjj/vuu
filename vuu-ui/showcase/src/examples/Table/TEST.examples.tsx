import { Table, TableProps } from "@vuu-ui/vuu-table";
import { useMemo } from "react";
import { TestTableName, getSchema, vuuModule } from "@vuu-ui/vuu-data-test";
import { useVuuMenuActions } from "@vuu-ui/vuu-data-react";
import { SchemaColumn } from "@vuu-ui/vuu-data-types";
import { ColumnDescriptor } from "@vuu-ui/vuu-table-types";
import { DemoTableContainer } from "./DemoTableContainer";
import { ContextMenuProvider } from "@vuu-ui/vuu-context-menu";

const extendColumnConfig = (
  columns: SchemaColumn[],
  config: Partial<ColumnDescriptor>,
) => columns.map<ColumnDescriptor>((col) => ({ ...col, ...config }));

const TestTable = ({
  tableName,
  ...props
}: Partial<TableProps> & { tableName: TestTableName }) => {
  const schema = getSchema(tableName);

  const tableProps = useMemo<Pick<TableProps, "config" | "dataSource">>(
    () => ({
      ...props,
      config: {
        columns: extendColumnConfig(schema.columns, {
          width: 150,
        }),
        rowSeparators: true,
        zebraStripes: true,
      },
      dataSource: vuuModule<TestTableName>("TEST").createDataSource(tableName),
    }),
    [props, schema.columns, tableName],
  );

  const { menuBuilder, menuActionHandler } = useVuuMenuActions({
    dataSource: tableProps.dataSource,
  });

  return (
    <ContextMenuProvider
      menuActionHandler={menuActionHandler}
      menuBuilder={menuBuilder}
    >
      <DemoTableContainer>
        <Table {...tableProps} renderBufferSize={50} />
      </DemoTableContainer>
    </ContextMenuProvider>
  );
};

export const TwoHundredColumns = (props: Partial<TableProps>) => (
  <TestTable tableName="TwoHundredColumns" {...props} width={914} />
);
