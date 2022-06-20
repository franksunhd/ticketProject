<template>
  <Box>
    <div class="formBox-top">
      <!-- 头部查询部分 -->
      <el-form :model="formItem" label-width="120px" :inline="true">
        <el-form-item label="线路：" class="marBottom7">
          <el-select
            @change="changeLines(formItem.lines)"
            v-model="formItem.lines"
            class="width200"
          >
            <el-option
              v-for="(item,index) in linesList"
              :key="index"
              :label="item.LINE_LOCATION_NAME"
              :value="item.LINE_LOCATION_NUMBER.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="车站：" class="marBottom7">
          <el-select v-model="formItem.station" class="width200">
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单据状态：" class="marBottom7">
          <el-select v-model="formItem.status" class="width200" clearable>
            <el-option
              v-for="item in statusList"
              :key="item.VALUE"
              :label="item.NAME"
              :value="item.VALUE"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="配发单号：" class="marBottom7">
          <el-input
            type="number"
            placeholder="请输入单号"
            v-model="formItem.orderNum"
            class="width200"
            clearable
          />
        </el-form-item>
        <el-form-item label="操作时间：" class="marBottom7">
          <el-date-picker
            v-model="formItem.dateTime"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <br />
        <el-form-item class="fr marBottom7">
          <el-button type="primary" class="query" v-if="limitBtn.queryBtn" @click="getData">查询</el-button>
          <el-button type="warning" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="tableWp">
      <!-- 按钮部分 -->
      <div class="marBottom10">
        <el-button
          type="primary"
          v-if="limitBtn.create"
          @click="createBtn"
          :disabled="disabledBtn.create"
        >创建配发单</el-button>
        <el-button
          type="primary"
          v-if="limitBtn.undo"
          @click="undoBtn"
          :disabled="disabledBtn.undo"
        >撤销</el-button>
        <el-button
          type="primary"
          v-if="limitBtn.accept"
          @click="acceptBtn"
          :disabled="disabledBtn.accept"
        >接收</el-button>
        <el-button
          type="primary"
          v-if="limitBtn.refuse"
          @click="turnBtn"
          :disabled="disabledBtn.refuse"
        >拒绝</el-button>
        <el-button
          type="primary"
          v-if="limitBtn.ticket"
          @click="ticketsBtn"
          :disabled="disabledBtn.ticket"
        >备票</el-button>
        <el-button
          type="primary"
          v-if="limitBtn.distribution"
          @click="dispatchingBtn"
          :disabled="disabledBtn.distribution"
        >配送</el-button>
      </div>
      <!-- 表格内容 -->
      <el-table
        :data="tableData"
        border
        stripe
        @row-click="rowClick"
        :default-sort="{prop: 'CREATE_ORDER_TIME', order: 'descending'}"
      >
        <el-table-column fixed label="请选择" align="center">
          <template slot-scope="scope">
            <el-radio
              @change.native="changeTableBox(scope.row)"
              v-model="tableSelect.id"
              :label="scope.row.ROW_ID"
            >&nbsp;</el-radio>
          </template>
        </el-table-column>
        <el-table-column fixed prop="ORDER_ID" label="配发单号" width="200" align="center" />
        <el-table-column prop="LINE_NAME" label="线路" align="center" />
        <el-table-column prop="IMPORT_STATION_NAME" label="调入车站" align="center" />
        <el-table-column prop="EXPORT_STATION_NAME" label="调出车站" align="center" />
        <el-table-column prop="ORDER_STATE_NAME" label="配发单状态" align="center" sortable />
        <el-table-column prop="BALANCE_DATE" label="运营日期" align="center" sortable />
        <el-table-column prop="CREATE_ORDER_TIME" label="创建时间" width="160" align="center" sortable />
        <el-table-column fixed="right" label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="primary" v-if="limitBtn.detail" @click.stop="detailBtn(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pages
        :total="options.total"
        :currentPage="options.currentPage"
        :page-size="options.pageSize"
        @handleSizeChangeSub="handleSizeChangeSub"
        @handleCurrentChangeSub="handleCurrentChange"
      />
    </div>
    <div class="dialog">
      <!-- 创建配发单 -->
      <el-dialog
        append-to-body
        :before-close="resetData"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :visible.sync="dialogVisible"
        :fullscreen="isScreenCreate"
      >
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">创建配发单</span>
          <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate = !isScreenCreate"></i>
        </div>
        <el-form :model="addEdit" ref="addEdit" label-width="110px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="线路：">
                <el-select v-model="addEdit.lines" disabled class="widthAll">
                  <el-option
                    v-for="(item,index) in linesList"
                    :key="index"
                    :label="item.LINE_LOCATION_NAME"
                    :value="item.LINE_LOCATION_NUMBER.toString()"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="操作员：">
                <el-input v-model="addEdit.operator_idAndName" class="widthAll" disabled />
              </el-form-item>
              <el-form-item label="创建位置：">
                <el-select v-model="addEdit.createLocation" disabled class="widthAll">
                  <el-option
                    v-for="(item,index) in stationList"
                    :key="index"
                    :label="item.STATION_LOCATION_NAME"
                    :value="item.LOCATION_NUMBER.toString()"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="调出位置：">
                <el-select v-model="addEdit.outLocation" disabled class="widthAll">
                  <el-option
                    v-for="(item,index) in stationList"
                    :key="index"
                    :label="item.STATION_LOCATION_NAME"
                    :value="item.LOCATION_NUMBER.toString()"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="认证操作员：" class="star">
                <el-input
                  placeholder="请输入操作员id"
                  v-model="addEdit.operationUser"
                  @blur="ruleAddForm(addEdit.operationUser,'userFlag')"
                />
                <span class="isNotNull" v-if="errorTip.userFlag">认证操作员不能为空</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="车站：">
                <el-select v-model="addEdit.station" disabled class="widthAll">
                  <el-option
                    v-for="(item,index) in stationList"
                    :key="index"
                    :label="item.STATION_LOCATION_NAME"
                    :value="item.LOCATION_NUMBER.toString()"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="单据类型：">
                <el-select v-model="addEdit.type" disabled class="widthAll">
                  <el-option label="配发单" value="01" />
                </el-select>
              </el-form-item>
              <!-- 此标签只用来占位，没有其他用途 -->
              <el-form-item class="visibility" label="占位隐藏：">
                <el-input v-model="addEdit.inLocation"></el-input>
              </el-form-item>
              <el-form-item label="调入位置：">
                <el-select
                  v-model="addEdit.inLocation"
                  class="widthAll"
                  @change="changeLocation(addEdit.inLocation)"
                >
                  <el-option
                    v-for="(item,index) in stationList"
                    :key="index"
                    :label="item.STATION_LOCATION_NAME"
                    :value="item.LOCATION_NUMBER.toString()"
                  />
                </el-select>
                <span class="isNotNull" v-if="errorTip.inLocationFlag">{{errorTip.inLocationTip}}</span>
              </el-form-item>
              <el-form-item class="star" label="密码：">
                <el-input
                  placeholder="请输入密码"
                  v-model="addEdit.operationPassword"
                  @blur="ruleAddForm(addEdit.operationPassword,'passwordFlag')"
                  type="password"
                  maxlength="12"
                />
                <span class="isNotNull" v-if="errorTip.passwordFlag">密码不能为空</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="备注：">
                <el-input
                  v-model="addEdit.commentInfo"
                  type="textarea"
                  maxlength="250"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="marBottom10">
          <el-button type="primary" @click="addListBtn">添加</el-button>
        </div>
        <!--表格-->
        <div class="lowerPart">
          <el-table border :data="addList" stripe>
            <el-table-column label="序号" width="80px" align="center">
              <template slot-scope="scope">
                <span>{{scope.$index + 1}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="车票库存类型" align="center" />
            <el-table-column prop="ticketNumber" label="当前库存数量(张)" align="center" />
            <el-table-column label="配发数量(张)" align="center">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.quantity_request"
                  oninput="value=value.replace(/[^\d]/g,'')"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100px" align="center">
              <template slot-scope="scope">
                <el-button type="danger" @click="deleteData(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div slot="footer">
          <el-button @click="resetData">取消</el-button>
          <el-button type="primary" @click="addEditData">保存</el-button>
        </div>
      </el-dialog>
      <!--添加内层蒙版-->
      <el-dialog
        append-to-body
        :before-close="resetTicket"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :visible.sync="dialogAddVisible"
        :fullscreen="isScreenAdd"
      >
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">添配发单票卡类型</span>
          <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenAdd = !isScreenAdd"></i>
        </div>
        <el-checkbox-group v-model="checkList">
          <el-checkbox
            class="checkBox"
            v-for="(item,index) in ticketTypeList"
            :key="index"
            :label="item.STOCK_MANAGE_TYPE_ID"
          >{{item.STOCK_TYPE_NAME_CN}}</el-checkbox>
        </el-checkbox-group>
        <div slot="footer">
          <el-button @click="resetTicket">取消</el-button>
          <el-button type="primary" @click="addTicket">确定</el-button>
        </div>
      </el-dialog>
      <!-- 备票 -->
      <el-dialog
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :visible.sync="dialogTicketVisible"
        :fullscreen="isScreenTicket"
      >
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">备票</span>
          <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenTicket = !isScreenTicket"></i>
        </div>
        <el-form :model="moneyFormItem" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="当前位置：">
                <el-select v-model="moneyFormItem.location" disabled class="widthAll">
                  <el-option
                    v-for="(item,index) in stationList"
                    :key="index"
                    :label="item.STATION_LOCATION_NAME"
                    :value="item.LOCATION_NUMBER.toString()"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="操作前状态：">
                <el-select v-model="moneyFormItem.status" disabled class="widthAll">
                  <el-option
                    v-for="item in statusList"
                    :key="item.VALUE"
                    :label="item.NAME"
                    :value="item.VALUE"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="认证操作员：" class="star">
                <el-input
                  v-model="moneyFormItem.operatorUser"
                  @blur="ruleTicketInput(moneyFormItem.operatorUser,'userFlag')"
                  placeholder="请输入操作员id"
                />
                <span class="isNotNull" v-if="moneyFormItem.userFlag">必填项不能为空</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单据编号：">
                <el-input v-model="moneyFormItem.orderNum" disabled />
              </el-form-item>
              <!-- 此标签只用来占位，没有其他用途 -->
              <el-form-item class="visibility" label="占位隐藏：">
                <el-input v-model="addEdit.inLocation"></el-input>
              </el-form-item>
              <el-form-item label="密码：" class="star">
                <el-input
                  v-model="moneyFormItem.operatorPassword"
                  @blur="ruleTicketInput(moneyFormItem.operatorPassword,'passwordFlag')"
                  type="password"
                  placeholder="请输入密码"
                  maxlength="12"
                />
                <span class="isNotNull" v-if="moneyFormItem.passwordFlag">必填项不能为空</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <el-table border :data="ticketTypeNum" stripe>
          <el-table-column prop="stock_manage_type_name" label="库存管理类型" align="center" />
          <el-table-column prop="ticketNum" label="可用库存数量(张)" align="center" />
          <el-table-column prop="requestNum" label="申请配发数量(张)" align="center" />
          <el-table-column label="实际配发数量(张)" align="center">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.quantity_actual"
                oninput="value=value.replace(/[^\d]/g,'')"
              />
            </template>
          </el-table-column>
        </el-table>
        <div slot="footer">
          <el-button @click="resetTicketBtn">取消</el-button>
          <el-button type="primary" @click="ticketCommit">保存</el-button>
        </div>
      </el-dialog>
      <!--配送-->
      <el-dialog
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :visible.sync="dialogSendVisible"
        :fullscreen="isScreenDispatching"
      >
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">配送</span>
          <i
            class="el-icon-copy-document"
            title="放大/缩小"
            @click="isScreenDispatching = !isScreenDispatching"
          ></i>
        </div>
        <el-form :model="sendFormItem" ref="sendFormItem" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="当前位置：">
                <el-select v-model="sendFormItem.location" disabled class="widthAll">
                  <el-option
                    v-for="(item,index) in stationList"
                    :key="index"
                    :label="item.STATION_LOCATION_NAME"
                    :value="item.LOCATION_NUMBER.toString()"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="认证操作员id：" class="star">
                <el-input
                  v-model="sendFormItem.operatorUser"
                  @blur="ruleSend(sendFormItem.operatorUser,'userFlag')"
                  placeholder="请输入操作员id"
                />
                <span class="isNotNull" v-if="sendFormItem.userFlag">必填项不能为空</span>
              </el-form-item>
              <el-form-item label="配送员id：" class="star">
                <el-input
                  placeholder="请输入配送员id"
                  v-model="sendFormItem.sendUser"
                  @blur="ruleSend(sendFormItem.sendUser,'sendUserFlag')"
                />
                <span class="isNotNull" v-if="sendFormItem.sendUserFlag">必填项不能为空</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单据编号：">
                <el-input v-model="sendFormItem.orderNum" disabled />
              </el-form-item>
              <el-form-item label="密码：" class="star">
                <el-input
                  v-model="sendFormItem.operatorPassword"
                  @blur="ruleSend(sendFormItem.operatorPassword,'passwordFlag')"
                  type="password"
                  placeholder="请输入密码"
                  maxlength="12"
                />
                <span class="isNotNull" v-if="sendFormItem.passwordFlag">必填项不能为空</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer">
          <el-button @click="resetSendData">取消</el-button>
          <el-button type="primary" @click="sendData">保存</el-button>
        </div>
      </el-dialog>
      <!--配发单详情-->
      <el-dialog
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :visible.sync="dialogDetailVisible"
        :fullscreen="isScreenDetail"
      >
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">配发单详情</span>
          <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenDetail = !isScreenDetail"></i>
        </div>
        <el-form :model="detailFormItem" ref="detailFormItem" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="单据编号：" class="marBottom7">
                <el-input v-model="detailFormItem.orderNum" disabled></el-input>
              </el-form-item>

              <el-form-item label="单据状态：" class="marBottom7">
                <el-input v-model="detailFormItem.status" disabled></el-input>
              </el-form-item>
              <el-form-item label="创建时间：" class="marBottom7">
                <el-input v-model="detailFormItem.createTime" disabled></el-input>
              </el-form-item>
              <el-form-item label="出库车站：" class="marBottom7">
                <el-input v-model="detailFormItem.outLocation" disabled></el-input>
              </el-form-item>
              <el-form-item label="入库车站：" class="marBottom7">
                <el-input v-model="detailFormItem.inLocation" disabled></el-input>
              </el-form-item>
              <el-form-item label="运营日期：" class="marBottom7">
                <el-input v-model="detailFormItem.balanceDate" disabled></el-input>
              </el-form-item>
              <el-form-item label="认证操作员：" class="marBottom7">
                <el-input v-model="detailFormItem.verifyOperator" disabled></el-input>
              </el-form-item>
              <el-form-item label="更新时间：" class="marBottom7">
                <el-input v-model="detailFormItem.upDate" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单据类型：">
                <el-select v-model="addEdit.type" disabled class="widthAll">
                  <el-option label="配发单" value="01" />
                </el-select>
              </el-form-item>
              <el-form-item label="操作人员：" class="marBottom7">
                <el-input v-model="detailFormItem.createName" disabled></el-input>
              </el-form-item>
              <el-form-item label="创建车站：" class="marBottom7">
                <el-input v-model="detailFormItem.createLocation" disabled></el-input>
              </el-form-item>
              <el-form-item label="出库时间：" class="marBottom7">
                <el-input v-model="detailFormItem.outTime" disabled></el-input>
              </el-form-item>
              <el-form-item label="入库时间：" class="marBottom7">
                <el-input v-model="detailFormItem.inTime" disabled></el-input>
              </el-form-item>
              <el-form-item label="调配原因：" class="marBottom7">
                <el-input v-model="detailFormItem.reason" disabled></el-input>
              </el-form-item>
              <el-form-item label="车票配送员：" class="marBottom7">
                <el-input v-model="detailFormItem.deliveryman" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="备注：" class="marBottom7">
                <el-input v-model="detailFormItem.commitInfo" disabled type="textarea"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <el-table border :data="tableDetail" stripe>
          <el-table-column prop="STOCK_TYPE_NAME_CN" label="库存管理类型" align="center" />
          <el-table-column prop="QUANTITY_REQUEST" label="计划配发数量(张)" align="center" />
          <el-table-column prop="QUANTITY_ACTUAL" label="实际配发数量(张)" align="center" />
          <el-table-column prop="COMMENT_INFO" label="备注" align="center" />
        </el-table>
        <div slot="footer">
          <el-button @click="dialogDetailVisible = false">取消</el-button>
          <el-button type="primary" @click="dialogDetailVisible = false">确定</el-button>
        </div>
      </el-dialog>
    </div>
  </Box>
</template>

<script>
import Box from "../../../components/Box";
import { dateFilter } from "../../../assets/js/filters";
export default {
  name: "ticketAllotment",
  components: {
    Box
  },
  data() {
    return {
      //创建配发单放大缩小
      isScreenCreate: false,
      // 内层添加放大缩小
      isScreenAdd: false,
      // 备票放大缩小
      isScreenTicket: false,
      // 配送放大缩小
      isScreenDispatching: false,
      // 详情放大缩小
      isScreenDetail: false,
      // 创建
      dialogVisible: false,
      // 备票
      dialogTicketVisible: false,
      // 配送
      dialogSendVisible: false,
      // 详情
      dialogDetailVisible: false,
      // 备票
      moneyFormItem: {
        location: "", // 当前位置
        operator_id: "", // 操作人员id
        orderNum: "", // 单据编号
        status: "", // 操作前状态
        operatorUser: "", // 认证操作员
        operatorPassword: "", // 密码
        userFlag: false, // 认证操作员标识
        passwordFlag: false // 密码标识
      },
      // 配送
      sendFormItem: {
        location: "", // 当前位置
        orderNum: "", // 单据编号
        operatorUser: "", // 认证操作员
        operatorPassword: "", // 密码
        sendUser: "", // 配送员id
        userFlag: false, // 认证操作员标识
        passwordFlag: false, // 密码标识
        sendUserFlag: false // 配送员校验
      },
      // 配发单详情
      detailFormItem: {
        orderNum: "", // 单据编号
        orderType: "", // 单据类型
        status: "", //单据状态
        createTime: "", // 创建时间
        createLocation: "", // 创建车站
        createName: "", // 操作人员
        balanceDate: "", // 运营日期
        outLocation: "", // 出库车站
        outTime: "", // 出库时间
        inLocation: "", // 入库车站
        inTime: "", // 入库时间
        reason: "", // 调配原因
        deliveryman: "", //配送员
        verifyOperator: "", //认证操作员
        upDate: "", //更新时间
        quantityActual: "", // 实际操作数量
        commitInfo: "" //备注
      },
      //详情内表格数据
      tableDetail: [],
      // 查询表单
      formItem: {
        lines: "", // 线路
        station: "", // 车站
        dateTime: [],
        orderNum: "" // 单据编号
      },
      // 分页
      options: {
        total: 0, // 总条数
        currentPage: 1, // 当前页码
        pageSize: 10 // 显示条数
      },
      // 线路集合
      linesList: [],
      // 车站集合
      stationList: [],
      tableData: [],
      // 添加列表
      addList: [],
      // 添加选中的票卡类型
      checkList: [],
      // 添加票卡类型列表
      ticketTypeList: [],
      //库存类型及数量
      ticketTypeNum: [],
      // 创建配发单
      addEdit: {
        lines: "", // 线路
        station: "", // 车站
        operator_idAndName: "", // 操作员
        createLocation: "", // 创建位置
        inLocation: "", // 调入位置
        outLocation: "", // 调出位置
        operationUser: "", // 认证操作员
        operationPassword: "", // 密码
        type: "01", //单据类型  01配发 02调拨 03上交 04回收
        commitInfo: "" //备注
      },
      // 添加
      dialogAddVisible: false,
      // 创建表单校验
      errorTip: {
        userFlag: false, // 认证操作员
        passwordFlag: false, // 密码
        inLocationFlag: false, // 调入位置
        inLocationTip: "" // 调入位置提示
      },
      //按钮权限
      limitBtn: {
        queryBtn: false, // 查询
        create: false, // 创建
        undo: false, // 撤销
        acceptBtn: false, //接收
        refuse: false, // 拒绝
        ticket: false, // 备票
        distribution: false, // 配送
        detail: false // 详情
      },
      // 启用禁用按钮
      disabledBtn: {
        create: true, // 创建
        undo: true, // 撤销
        accept: true, // 接收
        refuse: true, // 拒绝
        ticket: true, // 备票
        distribution: true // 配送
      },
      // 表格选中数据集合
      tableSelect: {
        id: "", // id
        order_id: "", // 单据编号
        order_status_before: "" // 单据操作前状态
      },
      // 配发单状态集合
      statusList: [],
      // 创建配发单参数
      postList: {
        reason: "1", // 调配原因
        ticket_stock_data: []
      },
      // 备票参数
      ticket_stock_data: []
    };
  },
  methods: {
    // 改变调入位置
    changeLocation(val) {
      var _t = this;
      if (val === "") {
        _t.errorTip.inLocationFlag = true;
        _t.errorTip.inLocationTip = "必填项不能为空";
      } else {
        if (val === _t.addEdit.outLocation) {
          _t.errorTip.inLocationFlag = true;
          _t.errorTip.inLocationTip = "调入位置与调出位置不能相同";
        } else {
          _t.errorTip.inLocationFlag = false;
          _t.errorTip.inLocationTip = "";
        }
      }
    },
    // 点击行
    rowClick(row) {
      var _t = this;
      _t.tableSelect.id = row.ROW_ID;
      _t.changeTableBox(row);
    },
    // 改变表格选中状态
    changeTableBox(row) {
      var _t = this;
      _t.tableSelect.order_id = row.ORDER_ID ? row.ORDER_ID : ""; // 单据编号
      _t.tableSelect.order_status_before = row.ORDER_STATE
        ? row.ORDER_STATE
        : ""; // 操作前的状态
      // 01:已申请；02:已确认；03:已关闭；04:待配送；05:配送中；06:已完成；07:已拒绝
      var roleName = _t.getCookie("USER_TYPE");
      var location_number = _t.getCookie("LOCATION_NUMBER");
      if (
        roleName !== null &&
        roleName !== "null" &&
        location_number !== null &&
        location_number !== "null"
      ) {
        switch (row.ORDER_STATE) {
          case "01": // 已申请 (MLC备票和撤销)
            if (roleName === "MLC" && location_number.substr(0, 1) === "3") {
              _t.disabledBtn.undo = false; // 撤销
              _t.disabledBtn.refuse = true; // 拒绝
              _t.disabledBtn.ticket = false; // 备票
              _t.disabledBtn.accept = true; // 接收
              _t.disabledBtn.distribution = true; // 配送
            } else {
              _t.disabledBtn.undo = true; // 撤销
              _t.disabledBtn.refuse = true; // 拒绝
              _t.disabledBtn.ticket = true; // 备票
              _t.disabledBtn.accept = true; // 接收
              _t.disabledBtn.distribution = true; // 配送
            }
            break;
          case "03": // 已关闭 (无)
            _t.disabledBtn.undo = true; // 撤销
            _t.disabledBtn.refuse = true; // 拒绝
            _t.disabledBtn.ticket = true; // 备票
            _t.disabledBtn.accept = true; // 接收
            _t.disabledBtn.distribution = true; // 配送
            break;
          case "04": // 待配送 (MLC配送)
            if (roleName === "MLC" && location_number.substr(0, 1) === "3") {
              _t.disabledBtn.undo = true; // 撤销
              _t.disabledBtn.refuse = true; // 拒绝
              _t.disabledBtn.ticket = true; // 备票
              _t.disabledBtn.accept = true; // 接收
              _t.disabledBtn.distribution = false; // 配送
            } else {
              _t.disabledBtn.undo = true; // 撤销
              _t.disabledBtn.refuse = true; // 拒绝
              _t.disabledBtn.ticket = true; // 备票
              _t.disabledBtn.accept = true; // 接收
              _t.disabledBtn.distribution = true; // 配送
            }
            break;
          case "05": // 配送中 (SC接收和拒绝)
            if (
              roleName === "SC" ||
              (roleName === "MLC" && location_number.substr(0, 1) === "1")
            ) {
              _t.disabledBtn.undo = true; // 撤销
              _t.disabledBtn.refuse = false; // 拒绝
              _t.disabledBtn.ticket = true; // 备票
              _t.disabledBtn.accept = false; // 接收
              _t.disabledBtn.distribution = true; // 配送
            } else {
              _t.disabledBtn.undo = true; // 撤销
              _t.disabledBtn.refuse = true; // 拒绝
              _t.disabledBtn.ticket = true; // 备票
              _t.disabledBtn.accept = true; // 接收
              _t.disabledBtn.distribution = true; // 配送
            }
            break;
          case "06": // 已完成(无)
            _t.disabledBtn.undo = true; // 撤销
            _t.disabledBtn.refuse = true; // 拒绝
            _t.disabledBtn.ticket = true; // 备票
            _t.disabledBtn.accept = true; // 接收
            _t.disabledBtn.distribution = true; // 配送
            break;
          case "07": // 已拒绝(MLC接收和拒绝)
            if (roleName === "MLC" && location_number.substr(0, 1) === "3") {
              _t.disabledBtn.undo = true; // 撤销
              _t.disabledBtn.refuse = false; // 拒绝
              _t.disabledBtn.ticket = true; // 备票
              _t.disabledBtn.accept = false; // 接收
              _t.disabledBtn.distribution = true; // 配送
            } else {
              _t.disabledBtn.undo = true; // 撤销
              _t.disabledBtn.refuse = true; // 拒绝
              _t.disabledBtn.ticket = true; // 备票
              _t.disabledBtn.accept = true; // 接收
              _t.disabledBtn.distribution = true; // 配送
            }
            break;
          default:
            _t.disabledBtn.undo = true; // 撤销
            _t.disabledBtn.refuse = true; // 拒绝
            _t.disabledBtn.ticket = true; // 备票
            _t.disabledBtn.accept = true; // 接收
            _t.disabledBtn.distribution = true; // 配送
            break;
        }
      }
    },
    // 重置表格选中数据
    resetTableValue() {
      var _t = this;
      _t.tableSelect.id = ""; // 重置选中id
      _t.tableSelect.order_id = ""; // 重置选中 单据id
      _t.tableSelect.order_status_before = ""; // 重置选中 单据操作前状态
      _t.disabledBtn.undo = true; // 撤销
      _t.disabledBtn.accept = true; // 接收
      _t.disabledBtn.refuse = true; // 拒绝
      _t.disabledBtn.ticket = true; // 备票
      _t.disabledBtn.distribution = true; // 配送
    },
    // 改变当前页码
    handleCurrentChange(val) {
      var _t = this;
      _t.options.currentPage = val;
      _t.getData();
    },
    // 改变每页显示条数
    handleSizeChangeSub(val) {
      var _t = this;
      _t.options.pageSize = val;
      _t.getData();
    },
    // 配发单详情
    detailBtn(row) {
      var _t = this;
      _t.dialogDetailVisible = true;
      var location_number = _t.getCookie("LOCATION_NUMBER");
      var user_id = _t.getCookie("USER_ID");
      if (
        location_number !== null &&
        location_number !== "null" &&
        user_id !== null &&
        user_id !== "null"
      ) {
        let str =
          "location_number=" +
          location_number +
          "&operator_id=" +
          user_id +
          "&order_id=" +
          row.ORDER_ID;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          location_number: location_number,
          operator_id: user_id,
          order_id: row.ORDER_ID,
          token: keyToken
        };
        _t.$api.post(
          "/tsGateWay/ticketTransfer/transferOrderDetailGateWay",
          params,
          function(res) {
            if (res.rtCode && res.rtCode === "10015") {
              // 单据编号
              _t.detailFormItem.orderNum = res.rtData.ORDER_ID
                ? res.rtData.ORDER_ID
                : "";
              // 单据类型
              _t.detailFormItem.orderType = res.rtData.ORDER_TYPE_NAME
                ? res.rtData.ORDER_TYPE_NAME
                : "";
              // 单据状态
              _t.detailFormItem.status = res.rtData.ORDER_STATE_NAME
                ? res.rtData.ORDER_STATE_NAME
                : "";
              // 创建时间
              _t.detailFormItem.createTime = res.rtData.CREATE_ORDER_TIME
                ? res.rtData.CREATE_ORDER_TIME
                : "";
              // 创建车站
              _t.detailFormItem.createLocation = res.rtData.CREATE_STATION_NAME
                ? res.rtData.CREATE_STATION_NAME
                : "";
              // 操作人员
              _t.detailFormItem.createName = res.rtData.CREATE_OPERATOR_ID
                ? res.rtData.CREATE_OPERATOR_ID
                : "";
              // 运营日期
              _t.detailFormItem.balanceDate = res.rtData.BALANCE_DATE
                ? res.rtData.BALANCE_DATE
                : "";
              // 出库车站
              _t.detailFormItem.outLocation = res.rtData.EXPORT_STATION_NAME
                ? res.rtData.EXPORT_STATION_NAME
                : "";
              // 出库时间
              _t.detailFormItem.outTime = res.rtData.EXPORT_TIME
                ? res.rtData.EXPORT_TIME
                : "";
              // 入库车站
              _t.detailFormItem.inLocation = res.rtData.IMPORT_STATION_NAME
                ? res.rtData.IMPORT_STATION_NAME
                : "";
              // 入库时间
              _t.detailFormItem.inTime = res.rtData.IMPORT_TIME
                ? res.rtData.IMPORT_TIME
                : "";
              // 调配原因
              _t.detailFormItem.reason = res.rtData.REASON
                ? res.rtData.REASON
                : "";
              // 配送员
              _t.detailFormItem.deliveryman = res.rtData.DELIVERY_OPERATOR_ID
                ? res.rtData.DELIVERY_OPERATOR_ID
                : "";
              // 认证操作员
              _t.detailFormItem.verifyOperator = res.rtData.CHECK_OPERATOR_ID
                ? res.rtData.CHECK_OPERATOR_ID
                : "";
              // 更新时间
              _t.detailFormItem.upDate = res.rtData.UPDATE_DT
                ? res.rtData.UPDATE_DT
                : "";
              // 备注
              _t.detailFormItem.commitInfo = res.rtData.COMMENT_INFO
                ? res.rtData.COMMENT_INFO
                : "";
              // 详情内表格
              _t.tableDetail = res.rtData.TRANSFER_ORDER_DETAIL_DATA;
            } else if (res.rtCode) {
              _t.alertDialogTip(_t, "查询失败!");
            }
          }
        );
      }
    },
    // 配发单状态
    getStatusData() {
      var _t = this;
      let str = "guid=GUID000722201906191619";
      let Base64 = require("js-base64").Base64;
      let keyToken = _t.$md5(Base64.encode(str));
      var params = {
        guid: "GUID000722201906191619",
        token: keyToken
      };
      _t.$api.post("/tsGateWay/ticketUtility/queryDict", params, function(res) {
        // 查询成功
        if (res.rtCode && res.rtCode === "14010") {
          _t.statusList = res.rtData === null ? [] : res.rtData;
        }
      });
    },
    // 查询按钮
    getData() {
      var _t = this;
      var role = _t.getCookie("USER_TYPE"); // 角色
      var location = _t.getCookie("LOCATION_NUMBER"); // 位置编号
      var user_id = _t.getCookie("USER_ID"); // 用户id
      var location_number = ""; // 发送请求的 位置编号
      var location_number_query = ""; // 发送请求的 query
      if (
        role !== null &&
        role !== "null" &&
        user_id !== null &&
        user_id !== "null" &&
        location !== null &&
        location !== "null"
      ) {
        if (
          role === "SC" ||
          (role === "MLC" && location.substr(0, 1) === "1")
        ) {
          // 车站为空
          if (_t.formItem.station === "") {
            location_number = location;
          } else {
            // 车站有值
            location_number = _t.formItem.station;
          }
        } else if (role === "MLC" && location.substr(0, 1) === "3") {
          // 线路为空
          if (_t.formItem.lines === "") {
            location_number = location;
          } else {
            // 线路不为空
            if (_t.formItem.station === "") {
              // 车站为空
              location_number = _t.formItem.lines;
            } else {
              // 车站不为空
              location_number = _t.formItem.station;
              location_number_query = _t.formItem.station;
            }
          }
        }
      }
      if (location_number !== "" && user_id !== null && user_id !== "null") {
        let str =
          "location_number=" + location_number + "&operator_id=" + user_id;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        let postData = {
          location_number: location_number, // 位置编码
          location_number_query:
            location_number_query === "" ? null : location_number_query, // 位置编码
          token: keyToken, // token
          operator_id: user_id,
          order_state: _t.formItem.status === "" ? null : _t.formItem.status, // 状态
          start_time:
            _t.formItem.dateTime !== null
              ? _t.formItem.dateTime[0] !== undefined
                ? dateFilter(_t.formItem.dateTime[0].getTime())
                : null
              : null, // 开始时间
          end_time:
            _t.formItem.dateTime !== null
              ? _t.formItem.dateTime[1] !== undefined
                ? dateFilter(_t.formItem.dateTime[1].getTime())
                : null
              : null, // 结束时间
          order_id: _t.formItem.orderNum === "" ? null : _t.formItem.orderNum, //单据编号
          order_type: "01", // 单据类型  01配发 02调拨 03上交 04回收
          pageNum: _t.options.currentPage, // 当前页
          pageSize: _t.options.pageSize // 每页显示条数
        };
        _t.$api.post(
          "/tsGateWay/ticketTransfer/transferOrderQueryGateWay",
          postData,
          function(res) {
            _t.$store.commit("setLoading", false);
            if (res.rtCode && res.rtCode === "10009") {
              _t.tableData = res.rtData === null ? [] : res.rtData;
              _t.options.total = res.totalCount ? res.totalCount : 0;
            } else {
              _t.alertDialogTip(_t, "查询失败!");
            }
          }
        );
      }
    },
    // 重置查询按钮
    resetQuery() {},
    // 创建配发单
    createBtn() {
      var _t = this;
      _t.dialogVisible = true;
      var location_number = _t.getCookie("LOCATION_NUMBER");
      var user_id = _t.getCookie("USER_ID");
      var user_name = _t.getCookie("USER_NAME");
      if (
        location_number !== null &&
        location_number !== "null" &&
        user_id !== null &&
        user_id !== "null"
      ) {
        _t.addEdit.lines = _t.formItem.lines; // 线路
        _t.addEdit.station = location_number; // 车站
        _t.addEdit.location_number = location_number; // 位置
        _t.addEdit.operator_id = user_id; // 操作员id
        _t.addEdit.operator_idAndName =
          user_name == null ? user_id : user_name + "-" + user_id;
        _t.addEdit.createLocation = location_number; //创建位置
        _t.addEdit.outLocation = location_number; //调出位置
        _t.addEdit.inLocation = _t.formItem.station; //调入位置
      }
    },
    // 添加类型
    addListBtn() {
      var _t = this;
      _t.dialogAddVisible = true;
      _t.getTicketType();
    },
    // 获取票卡类型
    getTicketType() {
      var _t = this;
      var location_number = _t.getCookie("LOCATION_NUMBER");
      var user_id = _t.getCookie("USER_ID");
      if (
        location_number !== null &&
        location_number !== "null" &&
        user_id !== null &&
        user_id !== "null"
      ) {
        let str =
          "location_number=" + location_number + "&operator_id=" + user_id;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          location_number: location_number,
          operator_id: user_id,
          token: keyToken,
          pageNum: 1,
          pageSize: 100
        };
        _t.$api.post(
          "/tsGateWay/inventoryListService/ticketTypeQueryGateWay",
          params,
          function(res) {
            if (res.rtCode && res.rtCode === "10005") {
              _t.ticketTypeList = res.rtData === null ? [] : res.rtData;
              // 勾选已有项
              var listArr = new Array();
              _t.addList.forEach(item => {
                listArr.push(item.id);
              });
              _t.checkList = listArr;
            }
          }
        );
      }
    },
    // 添加票卡类型
    addTicket() {
      var _t = this;
      var listArr = new Array();
      _t.ticketTypeList.forEach(item => {
        _t.checkList.forEach(val => {
          if (item.STOCK_MANAGE_TYPE_ID === val) {
            var obj = new Object();
            obj.id = item.STOCK_MANAGE_TYPE_ID;
            obj.name = item.STOCK_TYPE_NAME_CN;
            obj.ticketNumber = item.TICKET_NUMBER;
            obj.quantity_request = "0";
            obj.comment_info = "";
            listArr.push(obj);
          }
        });
      });
      _t.addList = listArr;
      _t.resetTicket();
    },
    // 重置添加
    resetTicket() {
      var _t = this;
      _t.dialogAddVisible = false;
      _t.checkList = [];
    },
    // 创建配发单重置
    resetData() {
      var _t = this;
      _t.dialogVisible = false;
      _t.addEdit.lines = ""; // 线路
      _t.addEdit.station = ""; // 车站
      _t.addEdit.operator_idAndName = ""; // 操作员
      _t.addEdit.createLocation = ""; // 创建位置
      _t.addEdit.inLocation = ""; // 调入位置
      _t.addEdit.outLocation = ""; // 调出位置
      _t.addEdit.commentInfo = ""; //备注
      _t.addEdit.type; //单据类型
      _t.addEdit.operationUser = ""; // 认证操作员
      _t.addEdit.operationPassword = ""; // 密码
      _t.errorTip.userFlag = false;
      _t.errorTip.passwordFlag = false;
      _t.errorTip.inLocationFlag = false; // 调入位置
      _t.errorTip.inLocationTip = ""; // 调入位置提示
      _t.addList = [];
    },
    // 删除数据
    deleteData(index) {
      var _t = this;
      _t.$confirm("是否确认删除?", "温馨提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          // 确定
          _t.addList.splice(index, 1);
        })
        .catch(() => {
          // 取消
          return false;
        });
    },
    // 创建表单校验
    ruleAddForm(val, flag) {
      var _t = this;
      if (val.trim() === "") {
        _t.errorTip[flag] = true;
      } else {
        _t.errorTip[flag] = false;
      }
    },
    // 提交创建配发单
    addEditData() {
      var _t = this;
      // 校验调入位置
      _t.changeLocation(_t.addEdit.inLocation);
      // _t.ruleAddForm(_t.addEdit.inLocation, "importFlag");
      // 校验认证操作员
      _t.ruleAddForm(_t.addEdit.operationUser, "userFlag");
      // 校验密码
      _t.ruleAddForm(_t.addEdit.operationPassword, "passwordFlag");
      // 校验库存表格
      if (_t.addList.length === 0) {
        _t.$alert("提交内容不能为空", "温馨提示", {
          confirmButtonText: "确定"
        })
          .then(() => {
            return false;
          })
          .catch(() => {
            return false;
          });
      } else {
        //不为空遍历
        var isErrorNumber = 0;
        var reg = _t.$config.isNumber();
        _t.addList.forEach(item => {
          if (item.quantity_request.trim() === "") {
            isErrorNumber++;
          }
          //校验配发数量格式是否正确
          if (reg.test(item.quantity_request.trim()) === false) {
            // 格式不正确
            isErrorNumber++;
          } else {
            // 格式正确 判断是否大于库存数量
            if (item.quantity_request.trim() * 1 > item.ticketNumber * 1) {
              isErrorNumber++;
            }
          }
        });
        if (isErrorNumber !== 0) {
          _t.alertDialogTip(
            _t,
            "请检查配发数量是否为空、格式是否正确、且不能大于库存数量!"
          );
        } else {
          // 可以提交
          if (
            _t.errorTip.userFlag === false &&
            _t.errorTip.passwordFlag === false &&
            _t.addList.length !== 0 &&
            _t.errorTip.inLocationFlag === false
          ) {
            var location_number = _t.getCookie("LOCATION_NUMBER");
            var user_id = _t.getCookie("USER_ID");
            if (
              location_number !== null &&
              location_number !== "null" &&
              user_id !== null &&
              user_id !== "null"
            ) {
              let str =
                "location_number=" +
                location_number +
                "&operator_id=" +
                user_id +
                "&order_type=" +
                _t.addEdit.type +
                "&create_location_number=" +
                location_number +
                "&import_location_number=" +
                _t.addEdit.inLocation +
                "&export_location_number=" +
                location_number +
                "&check_operator_id=" +
                _t.addEdit.operationUser.trim() +
                "&check_operator_password=" +
                _t.addEdit.operationPassword.trim();
              let Base64 = require("js-base64").Base64;
              let keyToken = _t.$md5(Base64.encode(str));
              var addList = new Array();
              _t.addList.forEach(item => {
                var obj = new Object();
                obj.stock_manage_type_id = item.id;
                obj.quantity_request = item.quantity_request;
                obj.comment_info =
                  item.comment_info === "" ? null : item.comment_info;
                addList.push(obj);
              });
              var params = {
                location_number: location_number, //车站
                operator_id: user_id, //登录用户
                check_operator_id: _t.addEdit.operationUser.trim(), //操作员
                check_operator_password: _t.addEdit.operationPassword.trim(), //密码
                token: keyToken,
                order_type: _t.addEdit.type, //单据类型
                create_location_number: location_number, //创建位置
                export_location_number: location_number, //调出位置
                import_location_number: _t.addEdit.inLocation, //调入位置
                reason: _t.postList.reason, //调配原因
                ticket_stock_data: addList,
                comment_info: _t.addEdit.commentInfo //备注
              };
              _t.$api.post(
                "/tsGateWay/ticketTransfer/transferOrderCreateGateWay",
                params,
                function(res) {
                  if (res.rtCode && res.rtCode === "10010") {
                    _t.$alert(res.rtMessage, "温馨提示", {
                      confirmButtonText: "确定",
                      cancelButtonText: "取消"
                    })
                      .then(() => {
                        _t.getData();
                        _t.resetData();
                      })
                      .catch(() => {
                        _t.getData();
                        _t.resetData();
                      });
                  } else if (res.rtCode) {
                    _t.alertDialogTip(_t, "操作失败!");
                  }
                }
              );
            }
          }
        }
      }
    },
    // 撤销
    undoBtn() {
      var _t = this;
      _t.$confirm("是否确认撤销", "温馨提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning"
      })
        .then(() => {
          // 是
          var location_number = _t.getCookie("LOCATION_NUMBER");
          var user_id = _t.getCookie("USER_ID");
          if (
            _t.tableSelect.order_id !== "" &&
            _t.tableSelect.order_status_before !== "" &&
            location_number !== null &&
            location_number !== "null" &&
            user_id !== null &&
            user_id !== "null"
          ) {
            let str =
              "location_number=" +
              location_number +
              "&operator_id=" +
              user_id +
              "&order_id=" +
              _t.tableSelect.order_id +
              "&order_state_before=" +
              _t.tableSelect.order_status_before;
            let Base64 = require("js-base64").Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              location_number: location_number, // 位置编码
              operator_id: user_id, // 操作员id
              order_id: _t.tableSelect.order_id, // 单据编号
              order_state_before: _t.tableSelect.order_status_before, // 操作前状态
              token: keyToken // token
            };
            _t.$api.post(
              "/tsGateWay/ticketTransfer/transferOrderCancelGateWay",
              params,
              function(res) {
                if (res.rtCode && res.rtCode === "10011") {
                  _t.$alert(res.rtMessage, "温馨提示", {
                    confirmButtonText: "确定"
                  })
                    .then(() => {
                      _t.getData();
                      _t.resetTableValue();
                    })
                    .catch(() => {
                      _t.getData();
                      _t.resetTableValue();
                    });
                } else if (res.rtCode) {
                  _t.$alert(res.rtMessage, "温馨提示", {
                    confirmButtonText: "确定"
                  })
                    .then(() => {
                      _t.resetTableValue();
                    })
                    .catch(() => {
                      _t.resetTableValue();
                    });
                }
              }
            );
          }
        })
        .catch(() => {
          // 否
          return false;
        });
    },
    // 接收
    acceptBtn() {
      var _t = this;
      _t.$confirm("是否确认接收", "温馨提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning"
      })
        .then(() => {
          // 是
          var location_number = _t.getCookie("LOCATION_NUMBER");
          var user_id = _t.getCookie("USER_ID");
          if (
            _t.tableSelect.order_id !== "" &&
            _t.tableSelect.order_status_before !== "" &&
            location_number !== null &&
            location_number !== "null" &&
            user_id !== null &&
            user_id !== "null"
          ) {
            let str =
              "location_number=" +
              location_number +
              "&operator_id=" +
              user_id +
              "&order_id=" +
              _t.tableSelect.order_id +
              "&order_state_before=" +
              _t.tableSelect.order_status_before;
            let Base64 = require("js-base64").Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              location_number: location_number, // 位置编码
              operator_id: user_id, // 操作员id
              order_id: _t.tableSelect.order_id, // 单据编号
              order_state_before: _t.tableSelect.order_status_before, // 操作前状态
              token: keyToken // token
            };
            _t.$api.post(
              "/tsGateWay/ticketTransfer/transferOrderAgreeGateWay",
              params,
              function(res) {
                if (res.rtCode && res.rtCode === "10018") {
                  _t.$alert(res.rtMessage, "温馨提示", {
                    confirmButtonText: "确定"
                  })
                    .then(() => {
                      _t.getData();
                      _t.resetTableValue();
                    })
                    .catch(() => {
                      _t.getData();
                      _t.resetTableValue();
                    });
                } else if (res.rtCode) {
                  _t.$alert(res.rtMessage, "温馨提示", {
                    confirmButtonText: "确定"
                  })
                    .then(() => {
                      _t.resetTableValue();
                    })
                    .catch(() => {
                      _t.resetTableValue();
                    });
                }
              }
            );
          }
        })
        .catch(() => {
          // 否
          return false;
        });
    },
    // 拒绝
    turnBtn() {
      var _t = this;
      _t.$confirm("是否确认拒绝", "温馨提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning"
      })
        .then(() => {
          // 是
          var location_number = _t.getCookie("LOCATION_NUMBER");
          var user_id = _t.getCookie("USER_ID");
          if (
            _t.tableSelect.order_id !== "" &&
            _t.tableSelect.order_status_before !== "" &&
            location_number !== null &&
            location_number !== "null" &&
            user_id !== null &&
            user_id !== "null"
          ) {
            let str =
              "location_number=" +
              location_number +
              "&operator_id=" +
              user_id +
              "&order_id=" +
              _t.tableSelect.order_id +
              "&order_state_before=" +
              _t.tableSelect.order_status_before;
            let Base64 = require("js-base64").Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              location_number: location_number, // 位置编码
              operator_id: user_id, // 操作员id
              order_id: _t.tableSelect.order_id, // 单据编号
              order_state_before: _t.tableSelect.order_status_before, // 操作前状态
              token: keyToken // token
            };
            _t.$api.post(
              "/tsGateWay/ticketTransfer/transferOrderRefuseGateWay",
              params,
              function(res) {
                if (res.rtCode && res.rtCode === "10012") {
                  _t.$alert(res.rtMessage, "温馨提示", {
                    confirmButtonText: "确定"
                  })
                    .then(() => {
                      _t.getData();
                      _t.resetTableValue();
                    })
                    .catch(() => {
                      _t.getData();
                      _t.resetTableValue();
                    });
                } else if (res.rtCode) {
                  _t.$alert(res.rtMessage, "温馨提示", {
                    confirmButtonText: "确定"
                  })
                    .then(() => {
                      _t.resetTableValue();
                    })
                    .catch(() => {
                      _t.resetTableValue();
                    });
                }
              }
            );
          }
        })
        .catch(() => {
          // 否
          return false;
        });
    },
    // 提示
    alertDialog(tip) {
      var _t = this;
      _t.$alert(tip, "温馨提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return false;
      });
    },
    // 备票
    ticketsBtn() {
      var _t = this;
      this.dialogTicketVisible = true;
      // 备款表单赋值
      var location_number = _t.getCookie("LOCATION_NUMBER");
      var user_id = _t.getCookie("USER_ID");
      var user_name = _t.getCookie("USER_NAME");
      if (
        location_number !== null &&
        location_number !== "null" &&
        user_id !== null &&
        user_id !== "null"
      ) {
        _t.moneyFormItem.location = location_number; // 当前位置
        _t.moneyFormItem.operator_id = user_id; // 操作员id
        _t.moneyFormItem.orderNum = _t.tableSelect.order_id; // 单据编号
        _t.moneyFormItem.status = _t.tableSelect.order_status_before; // 操作前状态
        // 先查询票卡库存数量
        _t.getTicketNumber(location_number, user_id);
      }
    },
    // 获取备票对应票卡类型的库存
    getTicketNumber(location_number, user_id) {
      var _t = this;
      let str =
        "location_number=" + location_number + "&operator_id=" + user_id;
      let Base64 = require("js-base64").Base64;
      let keyToken = _t.$md5(Base64.encode(str));
      var params = {
        location_number: location_number,
        operator_id: user_id,
        token: keyToken,
        pageNum: 1,
        pageSize: 100
      };
      _t.$api.post(
        "/tsGateWay/inventoryListService/ticketTypeQueryGateWay",
        params,
        function(res) {
          if (res.rtCode && res.rtCode === "10005") {
            // 1.全部的票卡库存数量
            var resData = res.rtData === null ? [] : res.rtData;
            // 2.查备票的详情
            _t.getTicketDetail(resData, location_number, user_id);
          } else {
            _t.alertDialog(res.rtMessage);
          }
        }
      );
    },
    // 查询备票的详情数据
    getTicketDetail(allTicket, location_number, user_id) {
      var _t = this;
      let str =
        "location_number=" +
        location_number +
        "&operator_id=" +
        user_id +
        "&order_id=" +
        _t.moneyFormItem.orderNum;
      let Base64 = require("js-base64").Base64;
      let keyToken = _t.$md5(Base64.encode(str));
      var params = {
        location_number: location_number,
        operator_id: user_id,
        order_id: _t.moneyFormItem.orderNum,
        token: keyToken
      };
      _t.$api.post(
        "/tsGateWay/ticketTransfer/transferOrderDetailGateWay",
        params,
        function(res) {
          if (res.rtCode && res.rtCode === "10015") {
            if (res.rtData) {
              //resData详情表格数据
              var resData =
                res.rtData.TRANSFER_ORDER_DETAIL_DATA === null
                  ? []
                  : res.rtData.TRANSFER_ORDER_DETAIL_DATA;
              var newArr = new Array();
              resData.forEach(item => {
                //对比票卡类型找到对应数据
                var Obj = new Object();
                var returnMap = allTicket.find(val => {
                  if (item.STOCK_MANAGE_TYPE_ID === val.STOCK_MANAGE_TYPE_ID) {
                    return val;
                  }
                });
                if (returnMap !== undefined) {
                  Obj.ticketNum = returnMap.TICKET_NUMBER; // 库存数量
                  Obj.ticketNum =
                    returnMap.TICKET_NUMBER !== undefined
                      ? returnMap.TICKET_NUMBER
                      : 0;
                } else {
                  Obj.ticketNum = 0;
                }
                Obj.stock_manage_type_id = item.STOCK_MANAGE_TYPE_ID; // 类型id 提交
                Obj.stock_manage_type_name = item.STOCK_TYPE_NAME_CN; // 显示的票卡类型名称
                Obj.requestNum = item.QUANTITY_REQUEST; // 申请的数量
                Obj.quantity_actual = "0"; //实际数量
                newArr.push(Obj);
              });
              _t.ticketTypeNum = newArr;
            }
          } else if (res.rtCode) {
            _t.alertDialog(res.rtMessage);
          }
        }
      );
    },
    // 校验备款输入
    ruleTicketInput(val, flag) {
      var _t = this;
      if (val.trim() === "") {
        _t.moneyFormItem[flag] = true;
      } else {
        _t.moneyFormItem[flag] = false;
      }
    },
    // 备票提交
    ticketCommit() {
      var _t = this;
      // 校验认证操作员
      if (_t.moneyFormItem.operatorUser.trim() === "") {
        _t.moneyFormItem.userFlag = true;
      } else {
        _t.moneyFormItem.userFlag = false;
      }
      // 校验密码
      if (_t.moneyFormItem.operatorPassword.trim() === "") {
        _t.moneyFormItem.passwordFlag = true;
      } else {
        _t.moneyFormItem.passwordFlag = false;
      }
      // 校验实际备票数量
      if (_t.ticketTypeNum.length !== 0) {
        // 条数不为0 校验实际数量 不能大于库存数量
        var isErrorNum = 0; // 错误数量
        _t.ticketTypeNum.forEach(item => {
          if (item.quantity_actual.trim() === "") {
            isErrorNum++;
          } else {
            // 不为空校验必须为数字
            var reg = _t.$config.isNumber();
            if (reg.test(item.quantity_actual.trim()) === false) {
              isErrorNum++;
            } else {
              // 校验是否大于库存
              if (item.quantity_actual.trim() * 1 > item.ticketNum * 1) {
                isErrorNum++;
              }
            }
          }
        });
        if (isErrorNum !== 0) {
          // 有错误
          _t.alertDialog("请检查实际配发数量是否为空或者是否大于库存数据!");
        } else {
          // 没有错误 可以提交
          if (
            _t.moneyFormItem.userFlag === false &&
            _t.moneyFormItem.passwordFlag === false
          ) {
            let str =
              "location_number=" +
              _t.moneyFormItem.location +
              "&operator_id=" +
              _t.moneyFormItem.operator_id +
              "&order_id=" +
              _t.moneyFormItem.orderNum +
              "&order_state_before=" +
              _t.moneyFormItem.status +
              "&check_operator_id=" +
              _t.moneyFormItem.operatorUser.trim() +
              "&check_operator_password=" +
              _t.moneyFormItem.operatorPassword.trim();
            let Base64 = require("js-base64").Base64;
            let keyToken = _t.$md5(Base64.encode(str));
            var params = {
              location_number: _t.moneyFormItem.location, // 当前位置
              operator_id: _t.moneyFormItem.operator_id, // 操作员id
              order_id: _t.moneyFormItem.orderNum, // 单据编号
              order_state_before: _t.moneyFormItem.status, // 操作前状态
              check_operator_id: _t.moneyFormItem.operatorUser.trim(), //认证操作员
              check_operator_password: _t.moneyFormItem.operatorPassword.trim(), // 密码
              ticket_stock_data: _t.ticketTypeNum,
              token: keyToken
            };
            _t.$api.post(
              "/tsGateWay/ticketTransfer/transferOrderPrepareTicketGateWay",
              params,
              function(res) {
                if (res.rtCode && res.rtCode === "10013") {
                  _t.$alert(res.rtMessage, "温馨提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消"
                  })
                    .then(() => {
                      _t.getData();
                      _t.resetTableValue();
                      _t.resetTicketBtn();
                    })
                    .catch(() => {
                      _t.getData();
                      _t.resetTableValue();
                      _t.resetTicketBtn();
                    });
                } else if (res.rtCode) {
                  _t.$alert(res.rtMessage, "温馨提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消"
                  })
                    .then(() => {
                      _t.resetTableValue();
                    })
                    .catch(() => {
                      _t.resetTableValue();
                    });
                }
              }
            );
          }
        }
      } else {
        _t.alertDialog("表格数据不能为空!");
      }
    },
    // 备票重置
    resetTicketBtn() {
      var _t = this;
      _t.dialogTicketVisible = false;
      _t.moneyFormItem.location = ""; // 当前位置
      _t.moneyFormItem.operator_id = ""; // 操作人员id
      _t.moneyFormItem.orderNum = ""; // 单据编号
      _t.moneyFormItem.status = ""; // 操作前状态
      _t.moneyFormItem.operatorUser = ""; // 认证操作员
      _t.moneyFormItem.operatorPassword = ""; // 密码
      _t.moneyFormItem.userFlag = false; // 认证操作员标识
      _t.moneyFormItem.passwordFlag = false; // 密码标识
    },
    // 配送
    dispatchingBtn() {
      var _t = this;
      this.dialogSendVisible = true;
      // 配送表单赋值
      var location_number = _t.getCookie("LOCATION_NUMBER");
      var user_id = _t.getCookie("USER_ID");
      var user_name = _t.getCookie("USER_NAME");
      if (
        location_number !== null &&
        location_number !== "null" &&
        user_id !== null &&
        user_id !== "null"
      ) {
        _t.sendFormItem.location = location_number; // 当前位置
        _t.sendFormItem.operator_id = user_id; // 操作员id
        _t.sendFormItem.orderNum = _t.tableSelect.order_id; // 单据编号
        _t.sendFormItem.status = _t.tableSelect.order_status_before; // 操作前状态
      }
    },
    // 校验配送表单
    ruleSend(val, flag) {
      var _t = this;
      if (val.trim() === "") {
        _t.sendFormItem[flag] = true;
      } else {
        _t.sendFormItem[flag] = false;
      }
    },
    // 配送提交
    sendData() {
      var _t = this;
      // 认证操作员
      _t.ruleSend(_t.sendFormItem.operatorUser, "userFlag");
      // 密码
      _t.ruleSend(_t.sendFormItem.operatorPassword, "passwordFlag");
      // 配送员id
      _t.ruleSend(_t.sendFormItem.sendUser, "sendUserFlag");
      // 可以提交
      if (
        _t.sendFormItem.userFlag === false &&
        _t.sendFormItem.passwordFlag === false &&
        _t.sendFormItem.sendUserFlag === false
      ) {
        let str =
          "location_number=" +
          _t.sendFormItem.location +
          "&operator_id=" +
          _t.sendFormItem.operator_id +
          "&order_id=" +
          _t.sendFormItem.orderNum +
          "&delivery_operator_id=" +
          _t.sendFormItem.sendUser.trim() +
          "&check_operator_id=" +
          _t.sendFormItem.operatorUser.trim() +
          "&check_operator_password=" +
          _t.sendFormItem.operatorPassword.trim() +
          "&order_state_before=" +
          _t.sendFormItem.status;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          location_number: _t.sendFormItem.location, // 位置
          operator_id: _t.sendFormItem.operator_id, // 操作员id
          order_id: _t.sendFormItem.orderNum, // 单据编号
          delivery_operator_id: _t.sendFormItem.sendUser.trim(), // 配送员id
          check_operator_id: _t.sendFormItem.operatorUser.trim(), // 认证操作员id
          check_operator_password: _t.sendFormItem.operatorPassword.trim(), // 密码
          order_state_before: _t.sendFormItem.status, // 操作前状态
          token: keyToken // token
        };
        _t.$api.post(
          "/tsGateWay/ticketTransfer/transferOrderSendGateWay",
          params,
          function(res) {
            if (res.rtCode && res.rtCode === "10014") {
              _t.$alert(res.rtMessage, "温馨提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消"
              })
                .then(() => {
                  _t.getData();
                  _t.resetTableValue();
                  _t.resetSendData();
                })
                .catch(() => {
                  _t.getData();
                  _t.resetTableValue();
                  _t.resetSendData();
                });
            } else if (res.rtCode) {
              _t.$alert(res.rtMessage, "温馨提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消"
              })
                .then(() => {
                  _t.resetTableValue();
                })
                .catch(() => {
                  _t.resetTableValue();
                });
            }
          }
        );
      }
    },
    // 重置配送表单
    resetSendData() {
      var _t = this;
      _t.dialogSendVisible = false;
      _t.sendFormItem.location = ""; // 当前位置
      _t.sendFormItem.operator_id = ""; // 操作员id
      _t.sendFormItem.orderNum = ""; // 单据编号
      _t.sendFormItem.status = ""; // 操作前状态
      _t.sendFormItem.operatorUser = ""; // 认证操作员
      _t.sendFormItem.operatorPassword = ""; // 密码
      _t.sendFormItem.sendUser = ""; // 配送员id
      _t.sendFormItem.userFlag = false; // 认证操作员标识
      _t.sendFormItem.passwordFlag = false; // 密码标识
      _t.sendFormItem.sendUserFlag = false; // 配送员校验
    },
    // 查询线路及车站
    getLinesAndStation() {
      var _t = this;
      var params = {};
      _t.$api.post(
        "/tsGateWay/ticketUtility/locationCascadeQuery",
        params,
        function(res) {
          // 查到线路信息
          if (res.rtCode && res.rtCode === "14007") {
            var linesStationArr = res.rtData === null ? [] : res.rtData;
            // 处理线路/车站/操作员数据
            _t.dealWithLinesAndStation(linesStationArr);
          } else if (res.rtCode) {
            _t.alertDialogTip(_t, "查询失败!");
          }
        }
      );
    },
    // 处理线路及车站首次加载数据问题
    dealWithLinesAndStation(linesStationArr) {
      var _t = this;
      // 判断角色
      var role = _t.getCookie("USER_TYPE");
      var location = _t.getCookie("LOCATION_NUMBER");
      // 角色和location都不为空
      if (
        role !== null &&
        role !== "null" &&
        location !== null &&
        location !== "null"
      ) {
        // 车站角色
        var linesArr = new Array(); // 线路集合
        var stationArr = new Array(); // 车站集合
        var LINE_LOCATION_NUMBER = ""; // 选中的线路
        var LOCATION_NUMBER = ""; // 选中的车站
        if (role === "SC") {
          // SC登录的具体车站
          linesStationArr.forEach(item => {
            // 存在车站集合
            if (item.stationList && item.stationList !== null) {
              // 遍历车站
              item.stationList.forEach(val => {
                // 找到了对应的车站
                if (val.LOCATION_NUMBER.toString() === location) {
                  // 线路下拉框
                  linesArr[0] = item;
                  // 线路选中值
                  LINE_LOCATION_NUMBER = item.LINE_LOCATION_NUMBER.toString();
                  // 车站下拉框
                  stationArr[0] = val;
                  // 车站选中值
                  LOCATION_NUMBER = location;
                }
              });
            }
          });
          _t.linesList = linesArr;
          _t.stationList = stationArr;
          // 选中的线路
          if (LINE_LOCATION_NUMBER !== "") {
            _t.formItem.lines = LINE_LOCATION_NUMBER;
          }
          // 选中的车站
          if (LOCATION_NUMBER !== "") {
            _t.formItem.station = LOCATION_NUMBER;
          }
        } else if (role === "MLC" && location.substr(0, 1) === "1") {
          // MLC登录的具体车站
          linesStationArr.forEach(item => {
            // 线路存在车站
            if (item.stationList && item.stationList !== null) {
              // 遍历车站
              item.stationList.forEach(val => {
                // 找到了对应的车站
                if (val.LOCATION_NUMBER.toString() === location) {
                  // 线路下拉框
                  linesArr = linesStationArr;
                  // 线路选中值
                  LINE_LOCATION_NUMBER = item.LINE_LOCATION_NUMBER.toString();
                  // 车站下拉框
                  stationArr = item.stationList;
                  // 车站选中值
                  LOCATION_NUMBER = location;
                }
              });
            }
          });
          _t.linesList = linesArr;
          _t.stationList = stationArr;
          // 选中的线路
          if (LINE_LOCATION_NUMBER !== "") {
            _t.formItem.lines = LINE_LOCATION_NUMBER;
          }
          // 选中的车站
          if (LOCATION_NUMBER !== "") {
            _t.formItem.station = LOCATION_NUMBER;
          }
        } else if (role === "MLC" && location.substr(0, 1) === "3") {
          // MLC登录线路中心
          linesArr = linesStationArr;
          // 遍历线路下拉框
          linesArr.forEach(item => {
            // 匹配到 线路
            if (item.LINE_LOCATION_NUMBER.toString() === location) {
              // 线路选中值
              _t.formItem.lines = item.LINE_LOCATION_NUMBER.toString();
              // 车站下拉框的值
              _t.stationList = item.stationList;
            }
          });
          _t.linesList = linesArr;
        }
      }
      // 线路接口调完之后调用查询接口
      _t.getData();
    },
    // 改变线路
    changeLines(val) {
      var _t = this;
      if (val !== "") {
        _t.linesList.forEach(item => {
          // 找到对应线路
          if (item.LINE_LOCATION_NUMBER.toString() === val) {
            // 存在对应的车站集合
            if (item.stationList && item.stationList !== null) {
              // 车站下拉框赋值
              _t.stationList = item.stationList;
            } else {
              // 车站下拉框置空
              _t.stationList = [];
            }
            // 选中车站置空
            _t.formItem.station = "";
          }
        });
      } else {
        // 选中线路为空
        _t.stationList = [];
        _t.formItem.station = "";
      }
    }
  },
  created() {
    var _t = this;
    _t.$store.commit("setLoading", true);
    var limitMenuList = JSON.parse(localStorage.getItem("limitMenuList"));
    if (limitMenuList !== null && limitMenuList.length !== 0) {
      var limitBtnArr = new Array();
      limitMenuList.forEach(item => {
        var path = _t.$route.path;
        // 找到了对应权限的页面
        if (item.URL === path) {
          // 获取按钮级别权限
          if (item.CHILDREN !== null) {
            limitBtnArr = item.CHILDREN;
          }
          // 本页面业务逻辑
          _t.getStatusData();
          _t.getLinesAndStation();
        }
      });
      // 判断权限按钮
      limitBtnArr.forEach(item => {
        // 查询
        if (item.MENU_ID === "GUID00000000000000000000000000000028") {
          _t.limitBtn.queryBtn = true;
        }
        // 创建配发单
        if (item.MENU_ID === "GUID00000000000000000000000000000029") {
          _t.limitBtn.create = true;
          var roleName = _t.getCookie("USER_TYPE");
          var locationNum = _t.getCookie("LOCATION_NUMBER");
          if (
            roleName !== null &&
            roleName !== "null" &&
            locationNum !== null &&
            locationNum !== "null"
          ) {
            // MLC角色 location_number 3开头 启用创建按钮
            if (roleName === "MLC" && locationNum.substr(0, 1) === "3") {
              // 取消禁用
              _t.disabledBtn.create = false;
            } else {
              _t.disabledBtn.create = true;
            }
          }
        }
        // 撤销
        if (item.MENU_ID === "GUID00000000000000000000000000000031") {
          _t.limitBtn.undo = true;
        }
        // 接收
        if (item.MENU_ID === "GUID00000000000000000000000000000032") {
          _t.limitBtn.accept = true;
        }
        // 拒绝
        if (item.MENU_ID === "GUID00000000000000000000000000000033") {
          _t.limitBtn.refuse = true;
        }
        // 备票
        if (item.MENU_ID === "GUID00000000000000000000000000000034") {
          _t.limitBtn.ticket = true;
        }
        // 配送
        if (item.MENU_ID === "GUID00000000000000000000000000000035") {
          _t.limitBtn.distribution = true;
        }
        // 配发单详情
        if (item.MENU_ID === "GUID00000000000000000000000000000036") {
          _t.limitBtn.detail = true;
        }
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
