package org.finos.vuu.core.module.editable

import org.finos.vuu.core.table.{DataTable, RowData, RowWithData, TableContainer}
import org.finos.vuu.net.ClientSessionId
import org.finos.vuu.net.rpc.{EditTableRpcHandler, EndEditSessionRpcHandler, RpcFunctionResult, RpcFunctionSuccess, RpcParams}
import org.finos.vuu.viewport.ViewPort

class EditModeRpcService extends EditTableRpcHandler with EndEditSessionRpcHandler {

  private val sourceTableName: String = "process"

  override def deleteRow(params: RpcParams): RpcFunctionResult = ???

  override def deleteSelectedRows(params: RpcParams): RpcFunctionResult = {
    // TODO 2231 this should be moved to generic handler
    params.viewPort.getSelection.foreach(key => {
      params.viewPort.table.asTable.processUpdate(key, RowWithData(key, Map("setToDelete" -> true)))
    }
    )
    RpcFunctionSuccess(None)
  }

  override def deleteCell(params: RpcParams): RpcFunctionResult = ???

  override def addRow(params: RpcParams): RpcFunctionResult = {
    val key: String = params.namedParams("key").asInstanceOf[String]
    val data: Map[String, Any] = params.namedParams("data").asInstanceOf[Map[String, Any]]
    // TODO 2299 add validation
    params.viewPort.table.asTable.processUpdate(key, RowWithData(key, data))
    RpcFunctionSuccess(None)
  }

  override def editRow(params: RpcParams): RpcFunctionResult = ???

  override def editCell(params: RpcParams): RpcFunctionResult = {
    val key: String = params.namedParams("key").asInstanceOf[String]
    val column: String = params.namedParams("column").asInstanceOf[String]
    val data: Any = params.namedParams("data")
    // TODO 2299 add validation
    params.viewPort.table.asTable.processUpdate(key, RowWithData(key, Map("rowId" -> key, column -> data)))
    RpcFunctionSuccess(None)
  }

  override def submitForm(params: RpcParams): RpcFunctionResult = ???

  override def closeForm(params: RpcParams): RpcFunctionResult = ???

  override def undoRowChange(params: RpcParams): RpcFunctionResult = {
    val key: String = params.namedParams("key").asInstanceOf[String]
    val originalData: RowData = tableContainer.getTable(sourceTableName).pullRow(key)
    params.viewPort.table.asTable.processUpdate(key, originalData)
    RpcFunctionSuccess(None)
  }

  def verifyPermission(params: RpcParams): Boolean = {
    // assume demo user always have permission to edit this table
    true
  }

  def validateData(params: RpcParams): Boolean = {
    // assume each rpc handled validation already for demo
    true
  }

  def submit(params: RpcParams): Boolean = {
    val sourceTable: DataTable = tableContainer.getTable(sourceTableName)
    val sessionTable = params.viewPort.table.asTable
    sessionTable.primaryKeys.foreach(
      key => sourceTable.processUpdate(key, sessionTable.pullRow(key))
    )
    true
  }
}
