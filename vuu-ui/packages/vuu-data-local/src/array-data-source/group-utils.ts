import type { DataSourceRow } from "@vuu-ui/vuu-data-types";
import type { VuuGroupBy } from "@vuu-ui/vuu-protocol-types";
import { ColumnMap, metadataKeys } from "@vuu-ui/vuu-utils";

export type KeyList = number[];
export type GroupMap = { [key: string]: GroupMap | KeyList };

const { DEPTH, IS_EXPANDED, KEY } = metadataKeys;

const timestamp = 0;
const isNew = false;

export const collapseGroup = (
  key: string,
  groupedRows: readonly DataSourceRow[],
): DataSourceRow[] => {
  const rows: DataSourceRow[] = [];

  for (
    let i = 0, idx = 0, collapsed = false, len = groupedRows.length;
    i < len;
    i++
  ) {
    const row = groupedRows[i];
    const { [DEPTH]: depth, [KEY]: rowKey } = row;
    if (rowKey === key) {
      const collapsedRow = row.slice() as DataSourceRow;
      collapsedRow[IS_EXPANDED] = false;
      rows.push(collapsedRow);
      idx += 1;
      collapsed = true;
      while (i < len - 1 && groupedRows[i + 1][DEPTH] > depth) {
        i += 1;
      }
    } else if (collapsed) {
      const newRow = row.slice() as DataSourceRow;
      newRow[0] = idx;
      newRow[1] = idx;
      rows.push(newRow);
      idx += 1;
    } else {
      rows.push(row);
      idx += 1;
    }
  }

  return rows;
};

export const expandGroup = (
  keys: string[],
  sourceRows: readonly DataSourceRow[],
  groupBy: VuuGroupBy,
  columnMap: ColumnMap,
  groupMap: GroupMap,
  processedData: readonly DataSourceRow[],
): DataSourceRow[] => {
  const groupIndices = groupBy.map<number>((column) => columnMap[column]);
  return dataRowsFromGroups2(
    groupMap,
    groupIndices,
    keys,
    sourceRows,
    undefined,
    undefined,
    undefined,
    processedData,
  );
};

const dataRowsFromGroups2 = (
  groupMap: GroupMap,
  groupIndices: number[],
  openKeys: string[],
  sourceRows: readonly DataSourceRow[] = [],
  root = "$root",
  depth = 1,
  rows: DataSourceRow[] = [],
  processedData: readonly DataSourceRow[],
) => {
  const keys = Object.keys(groupMap).sort();
  for (const key of keys) {
    const idx = rows.length;
    const groupKey = `${root}|${key}`;
    const row: DataSourceRow = [
      idx,
      idx,
      false,
      false,
      depth,
      childCount(groupMap[key]),
      groupKey,
      0,
      timestamp,
      isNew,
    ];
    // TODO whats this
    row[groupIndices[depth - 1]] = key;
    rows.push(row);

    if (openKeys.includes(groupKey)) {
      row[IS_EXPANDED] = true;
      if (Array.isArray(groupMap[key])) {
        pushChildren(
          rows,
          groupMap[key] as KeyList,
          sourceRows,
          groupKey,
          depth + 1,
        );
      } else {
        dataRowsFromGroups2(
          groupMap[key] as GroupMap,
          groupIndices,
          openKeys,
          sourceRows,
          groupKey,
          depth + 1,
          rows,
          processedData,
        );
      }
    }
  }

  for (const key in rows) {
    for (const index in rows) {
      if (rows[key][2] === false && processedData[index] != undefined) {
        if (
          rows[key][groupIndices[0]] === processedData[index][groupIndices[0]]
        ) {
          rows[key] = rows[key].splice(0, 8).concat(
            processedData[index].slice(
              8, // groupIndices[0] + 1,
              processedData[index].length,
            ),
          ) as DataSourceRow;
          break;
        }
      }
    }
  }

  return rows;
};

const pushChildren = (
  rows: DataSourceRow[],
  tree: KeyList,
  sourceRows: readonly DataSourceRow[],
  parentKey: string,
  depth: number,
) => {
  for (const rowIdx of tree) {
    const idx = rows.length;
    const sourceRow = sourceRows[rowIdx].slice() as DataSourceRow;
    sourceRow[0] = idx;
    sourceRow[1] = idx;
    sourceRow[DEPTH] = depth;
    sourceRow[KEY] = `${parentKey}|${sourceRow[KEY]}`;
    rows.push(sourceRow);
  }
};

export const groupRows = (
  rows: readonly DataSourceRow[],
  groupBy: VuuGroupBy,
  columnMap: ColumnMap,
): [DataSourceRow[], GroupMap] => {
  const groupIndices = groupBy.map<number>((column) => columnMap[column]);
  const groupTree = groupLeafRows(rows, groupIndices);
  const groupedDataRows = dataRowsFromGroups(groupTree, groupIndices);
  // 2) collapse int groups

  return [groupedDataRows, groupTree];
};

const dataRowsFromGroups = (groupTree: GroupMap, groupIndices: number[]) => {
  const depth = 0;
  const rows: DataSourceRow[] = [];
  let idx = 0;
  const keys = Object.keys(groupTree).sort();
  for (const key of keys) {
    const row: DataSourceRow = [
      idx,
      idx,
      false,
      false,
      1,
      childCount(groupTree[key]),
      `$root|${key}`,
      0,
      timestamp,
      isNew,
    ];
    row[groupIndices[depth]] = key;
    rows.push(row);
    idx += 1;
  }
  return rows;
};

function childCount(list: GroupMap | KeyList) {
  if (Array.isArray(list)) {
    return list.length;
  } else {
    return Object.keys(list).length;
  }
}

function groupLeafRows(leafRows: readonly DataSourceRow[], groupby: number[]) {
  const groups: GroupMap = {};
  const levels = groupby.length;
  const lastLevel = levels - 1;
  for (let i = 0, len = leafRows.length; i < len; i++) {
    const leafRow = leafRows[i];
    let target: GroupMap | KeyList = groups;
    let targetNode;
    let key;
    for (let level = 0; level < levels; level++) {
      const colIdx = groupby[level];
      key = leafRow[colIdx].toString();
      targetNode = (target as GroupMap)[key];
      if (targetNode && level === lastLevel) {
        // we're at leaf level, targetNode can only be a KeyList
        (targetNode as KeyList).push(i);
      } else if (targetNode) {
        target = targetNode;
      } else if (!targetNode && level < lastLevel) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        target = target[key] = {};
      } else if (!targetNode) {
        (target as GroupMap)[key] = [i];
      }
    }
  }
  return groups;
}
