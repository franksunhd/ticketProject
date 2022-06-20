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
        <el-form-item label="解行单号" class="marBottom7">
          <el-input placeholder="请输入内容" v-model="formItem.orderNum" class="width200" clearable />
        </el-form-item>
        <br />
        <el-form-item class="fr marBottom7">
          <el-button type="primary" v-if="limitBtn.queryBtn" @click="getData">查询</el-button>
          <el-button type="warning" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 按钮部分 -->
    <div class="marBottom10">
      <el-button
        type="primary"
        @click="create"
        v-if="limitBtn.create"
        :disabled="disabledBtn.create"
      >创建解行单</el-button>
      <el-button
        type="primary"
        @click="entering"
        v-if="limitBtn.entering"
        :disabled="disabledBtn.entering"
      >单据录入</el-button>
    </div>
    <!-- 表格内容 -->
    <div class="tableWp">
      <el-table
        :data="tableData"
        border
        :row-key="getRowKey"
        @select="selectionChange"
        @select-all="selectionChange"
        ref="clearSelection"
        stripe
        :default-sort="{prop: 'order_state_name', order: 'descending'}"
      >
        <el-table-column reserve-selection type="selection" fixed align="center" />
        <el-table-column prop="order_id" label="解行单号" align="center" />
        <el-table-column prop="line_name" label="线路" align="center" />
        <el-table-column prop="station_name" label="车站" align="center" />
        <el-table-column prop="bank_name" label="解行银行" align="center" />
        <el-table-column prop="apply_money_amount_yuan" label="解行金额(元)" align="center" />
        <el-table-column prop="order_state_name" label="状态" align="center" sortable />
        <el-table-column prop="update_dt" label="解行时间" align="center" sortable />
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
      <el-dialog
        :fullscreen="isScreenCreate"
        :visible.sync="dialogCreateVisible"
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :before-close="resetChecked"
      >
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">创建解行单</span>
          <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenCreate=!isScreenCreate"></i>
        </div>
        <el-form :model="addEdit" label-width="110px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="线路：">
                <el-select v-model="addEdit.lines" class="widthAll" disabled>
                  <el-option
                    v-for="(item,index) in linesList"
                    :key="index"
                    :label="item.LINE_LOCATION_NAME"
                    :value="item.LINE_LOCATION_NUMBER.toString()"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="操作类型：">
                <el-select
                  class="widthAll"
                  @change="changeType(addEdit.operation_type)"
                  v-model="addEdit.operation_type"
                  placeholder="请选择操作类型"
                >
                  <el-option
                    v-for="item in statusList"
                    :key="item.VALUE"
                    :label="item.NAME"
                    :value="item.VALUE"
                  />
                </el-select>
                <span v-if="errorTip.typeFlag" class="isNotNull">必选项不能为空</span>
              </el-form-item>
              <el-form-item label="解行银行：">
                <el-select
                  class="widthAll"
                  @change="changeType3(addEdit.bankCode)"
                  v-model="addEdit.bankCode"
                  placeholder="请选择银行"
                >
                  <el-option
                    v-for="item in bankList"
                    :key="item.VALUE"
                    :label="item.NAME"
                    :value="item.VALUE"
                  />
                </el-select>
                <span v-if="errorTip.bankFlag" class="isNotNull">必选项不能为空</span>
              </el-form-item>
              <el-form-item label="认证操作员" class="star">
                <el-input
                  placeholder="请输入操作员id"
                  @blur="blurInputUser(addEdit.operator_id,'userFlag')"
                  v-model="addEdit.operator_id"
                />
                <span v-if="errorTip.userFlag" class="isNotNull">操作员不能为空</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="车站：">
                <el-select v-model="addEdit.station" class="widthAll" disabled>
                  <el-option
                    v-for="(item,index) in stationList"
                    :key="index"
                    :label="item.STATION_LOCATION_NAME"
                    :value="item.LOCATION_NUMBER.toString()"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="收益库存(元)：">
                <el-input v-model="stockMoney" disabled />
              </el-form-item>
              <el-form-item label="解行金额(元)：">
                <el-input
                  placeholder="请输入解行金额"
                  v-model="addEdit.money"
                  maxlength="9"
                  @blur="blurInputUser(addEdit.money,'moneyFlag');loseFocus()"
                />
                <span v-if="errorTip.moneyFlag" class="isNotNull">解行金额不能为空</span>
              </el-form-item>
              <el-form-item label="密码：" class="star">
                <el-input
                  placeholder="请输入密码"
                  type="password"
                  maxlength="12"
                  @blur="blurInputUser(addEdit.identified_operator_password,'passwordFlag')"
                  v-model="addEdit.identified_operator_password"
                />
                <span v-if="errorTip.passwordFlag" class="isNotNull">密码不能为空</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注：">
            <el-input
              v-model="addEdit.commentInfo"
              type="textarea"
              maxlength="250"
              show-word-limit
            />
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="resetChecked">取消</el-button>
          <el-button type="primary" @click="addEditData">保存</el-button>
        </div>
      </el-dialog>
      <el-dialog
        :fullscreen="isScreenTypeIn"
        :visible.sync="dialogEnteringVisible"
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :before-close="resetCheckedTwo"
      >
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">单据录入</span>
          <i class="el-icon-copy-document" title="放大/缩小" @click="isScreenTypeIn = !isScreenTypeIn"></i>
        </div>
        <el-form label-width="100px" :model="enteringList">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="操作员ID">
                <el-input v-model="enteringList.operator_id" disabled />
              </el-form-item>
              <el-form-item label="操作类型">
                <el-select
                  class="widthAll"
                  @change="changeType2(enteringList.operation_type)"
                  v-model="enteringList.operation_type"
                  placeholder="请选择操作类型"
                  @blur="blurInputUser2(enteringList.operation_type,'typeFlag')"
                >
                  <el-option
                    v-for="item in statusList"
                    :key="item.VALUE"
                    :label="item.NAME"
                    :value="item.VALUE"
                  />
                </el-select>
                <span v-if="errorTip2.typeFlag" class="isNotNull">必选项不能为空</span>
              </el-form-item>
              <el-form-item label="认证操作员" class="star">
                <el-input
                  placeholder="请输入操作员id"
                  @blur="blurInputUser2(enteringList.operatorUser,'userFlag')"
                  v-model="enteringList.operatorUser"
                />
                <span v-if="errorTip2.userFlag" class="isNotNull">必填项不能为空</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="车站">
                <el-select v-model="enteringList.station" class="widthAll" disabled>
                  <el-option
                    v-for="(item,index) in stationList"
                    :key="index"
                    :label="item.STATION_LOCATION_NAME"
                    :value="item.LOCATION_NUMBER.toString()"
                  />
                </el-select>
              </el-form-item>
              <!-- 此标签只用来占位，没有其他用途 -->
              <el-form-item class="visibility" label="占位隐藏：">
                <el-input v-model="addEdit.inLocation"></el-input>
              </el-form-item>
              <el-form-item label="密码" class="star">
                <el-input
                  type="password"
                  placeholder="请输入密码"
                  maxlength="12"
                  @blur="blurInputUser2(enteringList.identified_operator_password,'passwordFlag')"
                  v-model="enteringList.identified_operator_password"
                />
                <span v-if="errorTip2.passwordFlag" class="isNotNull">必填项不能为空</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="lowerPart">
          <el-table border :data="selectedData" stripe>
            <el-table-column prop="money_send_order_id" label="解行单号" align="center" />
            <el-table-column prop="line_name" label="线路" align="center" />
            <el-table-column prop="station_name" label="车站" align="center" />
            <el-table-column prop="apply_money_amount" label="车站解行金额(元)" align="center" />
            <el-table-column label="银行解行金额(元)" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.money_amount" />
              </template>
            </el-table-column>
            <el-table-column label="备注" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.comment_info" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100px" align="center">
              <template slot-scope="scope">
                <el-button type="danger" @click="deleteData(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <span slot="footer">
          <el-button @click="resetCheckedTwo">取消</el-button>
          <el-button type="primary" @click="commitEntering">保存</el-button>
        </span>
      </el-dialog>
    </div>
  </Box>
</template>
<script>
import Box from "../../../components/Box";
import { dateFilter } from "../../../assets/js/filters";
export default {
  name: "profitSolution",
  components: { Box },
  data() {
    return {
      // 创建解行单放大缩小
      isScreenCreate: false,
      // 单据录入放大缩小
      isScreenTypeIn: false,
      // 查询表单
      formItem: {
        lines: "", // 线路
        station: "", // 车站
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
      //创建解行单
      dialogCreateVisible: false,
      // 单据录入
      dialogEnteringVisible: false,
      // 按钮权限
      limitBtn: {
        queryBtn: false, // 查询
        create: false, // 创建
        entering: false // 单据录入
      },
      // 启用禁用按钮
      disabledBtn: {
        create: true, //创建
        entering: true //单据录入
      },
      //收益库存
      stockAmount: [],
      // 库存金额
      stockMoney: "",
      //创建解行单
      addEdit: {
        lines: "", //线路
        station: "", //车站
        operation_type: "", //操作类型
        money: "", //解行金额
        moneyTwo: "",
        operator_id: "", //认证操作员
        identified_operator_password: "", //密码
        commentInfo: "", // 备注
        bankCode: "" //解行银行编码
      },
      // 创建解行单校验
      errorTip: {
        typeFlag: false, // 操作类型
        earningFlag: false, //收益库存
        moneyFlag: false, //解行金额
        userFlag: false, // 认证操作员
        passwordFlag: false, // 密码
        bankFlag: false // 解行银行编码
      },
      // 操作类型
      typeList: [],
      statusList: [],
      // 单据录入
      enteringList: {
        operator_id: "", //操作员ID
        lines: "", //线路
        station: "", //车站
        operation_type: "", //操作类型
        operatorUser: "", //认证操作员
        identified_operator_password: "" //密码
      },
      // 单据录入校验
      errorTip2: {
        typeFlag: false, //操作类型
        userFlag: false, //认证操作员
        passwordFlag: false // 密码
      },
      //单据录入提交携带的参数
      enteringParams: {
        guid: "", //指定系统解行编号
        money_send_order_id: "", //银行提供的解行单号
        bankMoneyAmount: "" //银行解行金额
      },
      //选中的数据集合
      selectedData: [],
      // 银行及编码值
      bankList: []
    };
  },
  methods: {
    // 创建解行单失去焦点自动保留两位小数
    loseFocus() {
      var _t = this;
      if (_t.addEdit.money.trim() == "") {
        _t.addEdit.money = "";
      } else {
        _t.addEdit.moneyTwo = _t.addEdit.money ? _t.addEdit.money : "";
        _t.addEdit.money = (_t.addEdit.moneyTwo * 1).toFixed(2)
          ? (_t.addEdit.moneyTwo * 1).toFixed(2)
          : "";
      }
      // if (_t.addEdit.money === _t.addEdit.moneyTwo * 1) {
      //   _t.addEdit.money = _t.addEdit.money;
      // } else {
      //   _t.addEdit.money = "";
      // }
    },
    // 点击复选框
    selectionChange(row) {
      var _t = this;
      if (row.length !== 0) {
        _t.disabledBtn.entering = false;
      } else {
        _t.disabledBtn.entering = true;
      }
      var selectedArr = new Array();
      row.forEach(item => {
        var obj = new Object();
        obj.money_send_order_id = item.money_send_order_id; //解行单号
        obj.line_name = item.line_name; //线路
        obj.station_name = item.station_name; //车站
        obj.apply_money_amount = item.apply_money_amount_yuan; //车站解行金额
        obj.money_amount = "0"; //银行解行金额
        obj.guid = item.guid;
        obj.comment_info = "";
        selectedArr.push(obj);
      });
      _t.selectedData = selectedArr;
    },
    // 返回row-key
    getRowKey(row) {
      return row.order_id;
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
    // 点击创建解行单
    create() {
      var _t = this;
      _t.dialogCreateVisible = true;
      var location_number = _t.getCookie("LOCATION_NUMBER");
      var user_id = _t.getCookie("USER_ID");
      if (
        location_number !== null &&
        location_number !== "null" &&
        user_id !== null &&
        user_id !== "null"
      ) {
        _t.addEdit.lines = _t.formItem.lines; // 线路
        _t.addEdit.station = location_number; // 车站
        // 获取操作类型及原因
        _t.getTypeAndReason();
      }
    },
    // 创建解行单提交
    addEditData() {
      var _t = this;
      // 校验操作类型
      if (
        _t.addEdit.operation_type === null ||
        _t.addEdit.operation_type === ""
      ) {
        _t.errorTip.typeFlag = true;
      } else {
        _t.errorTip.typeFlag = false;
      }
      // 校验解行金额
      if (_t.addEdit.money === null || _t.addEdit.money === "") {
        _t.errorTip.moneyFlag = true;
      } else {
        _t.errorTip.moneyFlag = false;
      }
      // 校验操作人员
      if (_t.addEdit.operator_id.trim() === "") {
        _t.errorTip.userFlag = true;
      } else {
        _t.errorTip.userFlag = false;
      }
      // 校验密码
      if (_t.addEdit.identified_operator_password.trim() === "") {
        _t.errorTip.passwordFlag = true;
      } else {
        _t.errorTip.passwordFlag = false;
      }
      // 校验银行
      if (_t.addEdit.bankCode === null || _t.addEdit.bankCode === "") {
        _t.errorTip.bankFlag = true;
      } else {
        _t.errorTip.bankFlag = false;
      }
      if (
        _t.errorTip.typeFlag === false &&
        _t.errorTip.earningFlag === false &&
        _t.errorTip.moneyFlag === false &&
        _t.errorTip.userFlag === false &&
        _t.errorTip.passwordFlag === false &&
        _t.errorTip.bankFlag === false
      ) {
        var location_number = _t.getCookie("LOCATION_NUMBER");
        var user_id = _t.getCookie("USER_ID");
        // 提交
        let str =
          "userid=" +
          user_id +
          "&location_number=" +
          location_number +
          "&apply_money_amount=" +
          _t.addEdit.money * 100 +
          "&bank_code=" +
          _t.addEdit.bankCode +
          "&check_operator_id=" +
          _t.addEdit.operator_id.trim() +
          "&check_operator_password=" +
          _t.addEdit.identified_operator_password.trim();
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          userid: user_id, // 操作员id
          location_number: location_number.toString(), // 位置编号
          apply_money_amount: _t.addEdit.money * 100, //解行金额
          bank_code: _t.addEdit.bankCode, //解行银行
          check_operator_id: _t.addEdit.operator_id, // 认证操作员
          check_operator_password: _t.addEdit.identified_operator_password, // 密码
          comment_info: _t.addEdit.commentInfo, //备注
          token: keyToken //token
        };
        _t.$api.post(
          "/tsGateWay/incomeMoney/createMoneySendBankOrderGateWay",
          params,
          function(res) {
            // 操作成功
            if (res.rtCode && res.rtCode === "11015") {
              _t.$alert(res.rtMessage, "温馨提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消"
              })
                .then(() => {
                  _t.getData();
                  _t.resetChecked();
                })
                .catch(() => {
                  _t.getData();
                  _t.resetChecked();
                });
            } else {
              _t.alertDialogTip(_t, "操作失败!");
            }
          }
        );
      }
    },
    // 取消时重置创建校验
    resetChecked() {
      var _t = this;
      _t.dialogCreateVisible = false; // 隐藏蒙版
      _t.addEdit.lines = ""; // 线路
      _t.addEdit.station = ""; // 车站
      _t.addEdit.operation_type = ""; // 操作类型
      _t.addEdit.earnings = ""; // 收益库存
      _t.addEdit.money = ""; // 解行金额
      _t.addEdit.bankCode = ""; //解行银行
      _t.addEdit.operator_id = ""; // 认证操作员
      _t.addEdit.identified_operator_password = ""; // 密码
      _t.addEdit.commentInfo = ""; //备注
      _t.errorTip.typeFlag = false; // 操作类型
      _t.errorTip.earningFlag = false; // 收益库存
      _t.errorTip.moneyFlag = false; // 解行金额
      _t.errorTip.userFlag = false; // 认证操作员
      _t.errorTip.passwordFlag = false; // 密码
      _t.errorTip.bankFlag = false; //解行银行
    },
    // 创建解行单校验
    blurInputUser(val, flag) {
      var _t = this;
      if (val.trim() === "") {
        _t.errorTip[flag] = true;
      } else {
        _t.errorTip[flag] = false;
      }
    },
    // 单据录入校验
    blurInputUser2(val, flag) {
      var _t = this;
      if (val.trim() === "") {
        _t.errorTip2[flag] = true;
      } else {
        _t.errorTip2[flag] = false;
      }
    },
    // 点击单据录入
    entering() {
      var _t = this;
      _t.dialogEnteringVisible = true;
      var location_number = _t.getCookie("LOCATION_NUMBER");
      var user_id = _t.getCookie("USER_ID");
      if (
        location_number !== null &&
        location_number !== "null" &&
        user_id !== null &&
        user_id !== "null"
      ) {
        //需要改参数的部分=================================================
        _t.selectedData.forEach(item => {
          _t.enteringParams.money_send_order_id = item.money_send_order_id; //银行提供解行单号
          _t.enteringParams.guid = item.guid; //guid
          _t.enteringParams.bankMoneyAmount = item.money_amount;
        });
        _t.enteringList.operator_id = user_id; // 操作员ID
        _t.enteringList.station = location_number; // 车站
        // 获取操作类型及原因
        _t.getTypeAndReason();
      }
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
          _t.selectedData.splice(index, 1);
        })
        .catch(() => {
          // 取消
          return false;
        });
    },
    // 单据录入提交
    commitEntering() {
      var _t = this;
      // 校验操作类型
      if (
        _t.enteringList.operation_type === null ||
        _t.enteringList.operation_type === ""
      ) {
        _t.errorTip2.typeFlag = true;
      } else {
        _t.errorTip2.typeFlag = false;
      }
      // 校验操作人员
      if (_t.enteringList.operatorUser.trim() === "") {
        _t.errorTip2.userFlag = true;
      } else {
        _t.errorTip2.userFlag = false;
      }
      // 校验密码
      if (_t.enteringList.identified_operator_password.trim() === "") {
        _t.errorTip2.passwordFlag = true;
      } else {
        _t.errorTip2.passwordFlag = false;
      }
      if (
        _t.errorTip2.typeFlag === false &&
        _t.errorTip2.userFlag === false &&
        _t.errorTip2.passwordFlag === false
      ) {
        var location_number = _t.getCookie("LOCATION_NUMBER");
        var user_id = _t.getCookie("USER_ID");
        // 提交
        let str =
          "userid=" +
          user_id +
          "&location_number=" +
          location_number +
          "&guid=" +
          _t.enteringParams.guid +
          "&money_send_order_id=" +
          _t.enteringParams.money_send_order_id +
          "&money_amount=" +
          _t.enteringParams.bankMoneyAmount * 100 +
          "&check_operator_id=" +
          _t.enteringList.operatorUser.trim() +
          "&check_operator_password=" +
          _t.enteringList.identified_operator_password.trim();
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        var params = {
          userid: user_id, // 操作员id
          location_number: location_number.toString(), // 位置编号
          guid: _t.enteringParams.guid, //指定的解行编号
          money_send_order_id: _t.enteringParams.money_send_order_id, //银行单据号
          money_amount: _t.enteringParams.bankMoneyAmount * 100, //解行金额
          check_operator_id: _t.enteringList.operatorUser.trim(), //认证操作员
          check_operator_password: _t.enteringList.identified_operator_password.trim(), //密码
          token: keyToken //token
        };
        _t.$api.post(
          "/tsGateWay/incomeMoney/updateMoneySendBankOrderGateWay",
          params,
          function(res) {
            // 操作成功
            if (res.rtCode && res.rtCode === "11016") {
              _t.$alert(res.rtMessage, "温馨提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消"
              })
                .then(() => {
                  _t.getData();
                  _t.resetCheckedTwo();
                })
                .catch(() => {
                  _t.getData();
                  _t.resetCheckedTwo();
                });
            } else {
              _t.alertDialogTip(_t, "操作失败!");
            }
          }
        );
      }
    },
    // 取消时重置录入校验
    resetCheckedTwo() {
      var _t = this;
      _t.disabledBtn.entering = true;
      _t.dialogEnteringVisible = false; // 隐藏蒙版
      _t.enteringList.operator_id = ""; // 操作员ID
      _t.enteringList.station = ""; // 车站
      _t.enteringList.operation_type = ""; // 操作类型
      _t.enteringList.operatorUser = ""; // 认证操作员
      _t.enteringList.identified_operator_password = ""; // 密码
      _t.selectedData = [];
      _t.$refs.clearSelection.clearSelection();
      _t.errorTip2.typeFlag = false; // 操作类型
      _t.errorTip2.userFlag = false; // 认证操作人员
      _t.errorTip2.passwordFlag = false; // 密码
    },
    // 获取收益库存
    getStockAmount() {
      var _t = this;
      var location = _t.getCookie("LOCATION_NUMBER"); // 位置编号
      var user_id = _t.getCookie("USER_ID"); // 用户ids
      var location_number = ""; // 发送请求的 位置编号
      let str = "userid=" + user_id + "&location_number=" + location;
      let Base64 = require("js-base64").Base64;
      let keyToken = _t.$md5(Base64.encode(str));
      let postData = {
        userid: user_id,
        location_number: location,
        pageNum: _t.options.currentPage, // 当前页
        pageSize: _t.options.pageSize, //每页显示条数
        token: keyToken
      };
      _t.$api.post(
        "/tsGateWay/incomeMoney/searchMoneyStockGateWay",
        postData,
        function(res) {
          console.log(res);
          if (res.rtCode && res.rtCode === "11001") {
            _t.stockAmount = res.rtData;
            _t.stockAmount.forEach(item => {
              _t.stockMoney =
                item.money_amount_yuan === null ? "" : item.money_amount_yuan;
            });
          }else if(res.rtCode){
            _t.stockMoney = "0.01";
          }
        }
      );
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
        let str = "userid=" + user_id + "&location_number=" + location_number;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        let postData = {
          userid: user_id,
          location_number: location_number, // 位置编码
          pageNum: _t.options.currentPage, // 当前页
          pageSize: _t.options.pageSize, //每页显示条数
          order_id: _t.formItem.orderNum === "" ? null : _t.formItem.orderNum, // 单据编号
          token: keyToken // token
        };
        _t.$api.post(
          "/tsGateWay/incomeMoney/searchMoneySendBankOrderGateWay",
          postData,
          function(res) {
            _t.$store.commit("setLoading", false);
            if (res.rtCode && res.rtCode === "11014") {
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
    //获取状态
    getStatusData() {
      var _t = this;
      let str = "guid=GUID000722201906191719";
      let Base64 = require("js-base64").Base64;
      let keyToken = _t.$md5(Base64.encode(str));
      var params = {
        guid: "GUID000722201906191719",
        token: keyToken
      };
      _t.$api.post("/tsGateWay/ticketUtility/queryDict", params, function(res) {
        // 查询成功
        if (res.rtCode && res.rtCode === "14010") {
          _t.statusList = res.rtData === null ? [] : res.rtData;
        }
      });
    },
    //获取银行及编码
    getBankData() {
      var _t = this;
      let str = "guid=GUID000722201906191816";
      let Base64 = require("js-base64").Base64;
      let keyToken = _t.$md5(Base64.encode(str));
      var params = {
        guid: "GUID000722201906191816",
        token: keyToken
      };
      _t.$api.post("/tsGateWay/ticketUtility/queryDict", params, function(res) {
        // 查询成功
        if (res.rtCode && res.rtCode === "14010") {
          _t.bankList = res.rtData === null ? [] : res.rtData;
        }
      });
    },
    // 获取操作类型及原因
    getTypeAndReason() {
      var _t = this;
      var params = {
        typeid: "02" // 01 车票 02 现金
      };
      _t.$api.post(
        "/tsGateWay/ticketUtility/typeReasonCascadeQuery",
        params,
        function(res) {
          // 查询成功
          if (res.rtCode && res.rtCode === "14002") {
            _t.typeList = res.rtData === null ? [] : res.rtData;
          }
        }
      );
    },
    // 改变创建操作类型
    changeType(val) {
      var _t = this;
      if (val !== null && val !== "") {
        _t.errorTip.typeFlag = false;
        _t.typeList.forEach(item => {
          if (item.TYPE_VALUE === val) {
            // 变更原因赋值
            _t.reasonList = item.reasonList === null ? [] : item.reasonList;
          }
        });
      } else {
        _t.errorTip.typeFlag = true;
      }
    },
    //校验解行银行
    changeType3(val) {
      var _t = this;
      if (_t.val !== null && val !== "") {
        _t.errorTip.bankFlag = false;
      } else {
        _t.errorTip.bankFlag = true;
      }
    },
    // 改变录入操作类型
    changeType2(val) {
      var _t = this;
      if (val !== null && val !== "") {
        _t.errorTip2.typeFlag = false;
        _t.typeList.forEach(item => {
          if (item.TYPE_VALUE === val) {
            // 变更原因赋值
            _t.reasonList = item.reasonList === null ? [] : item.reasonList;
          }
        });
      } else {
        _t.errorTip2.typeFlag = true;
      }
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
    // 处理线路/车站/操作员之间首次加载数据问题
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
        var operationArr = new Array(); // 操作员id集合
        var LINE_LOCATION_NUMBER = ""; // 选中的线路
        var LOCATION_NUMBER = ""; // 选中的车站
        var USERID = ""; // 选中的操作员
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
                  // 存在操作员集合
                  if (val.userList && val.userList !== null) {
                    // 操作员集合赋值 允许多个操作员
                    operationArr = val.userList;
                    // 遍历操作员集合
                    operationArr.forEach(data => {
                      // 匹配到自身 并赋值
                      if (data.USERID === _t.getCookie("USER_ID")) {
                        USERID = data.USERID;
                      }
                    });
                  }
                }
              });
            }
          });
          _t.linesList = linesArr;
          _t.stationList = stationArr;
          _t.operatorIdList = operationArr;
          // 选中的线路
          if (LINE_LOCATION_NUMBER !== "") {
            _t.formItem.lines = LINE_LOCATION_NUMBER;
          }
          // 选中的车站
          if (LOCATION_NUMBER !== "") {
            _t.formItem.station = LOCATION_NUMBER;
          }
          // 选中的操作员
          if (USERID !== "") {
            _t.formItem.operationId = USERID;
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
                  if (val.userList && val.userList !== null) {
                    operationArr = val.userList;
                    operationArr.forEach(data => {
                      if (data.USERID === _t.getCookie("USER_ID")) {
                        USERID = data.USERID;
                      }
                    });
                  }
                }
              });
            }
          });
          _t.linesList = linesArr;
          _t.stationList = stationArr;
          _t.operatorIdList = operationArr;
          // 选中的线路
          if (LINE_LOCATION_NUMBER !== "") {
            _t.formItem.lines = LINE_LOCATION_NUMBER;
          }
          // 选中的车站
          if (LOCATION_NUMBER !== "") {
            _t.formItem.station = LOCATION_NUMBER;
          }
          // 选中的操作员
          if (USERID !== "") {
            _t.formItem.operationId = USERID;
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
          _t.getBankData();
          _t.getLinesAndStation();
          _t.getStockAmount();
        }
      });
      // 判断权限按钮
      limitBtnArr.forEach(item => {
        // 查询
        if (item.MENU_ID === "GUID00000000000000000000000000000093") {
          _t.limitBtn.queryBtn = true;
        }
        // 创建解行单
        if (item.MENU_ID === "GUID00000000000000000000000000000094") {
          _t.limitBtn.create = true;
          var roleName = _t.getCookie("USER_TYPE");
          var locationNum = _t.getCookie("LOCATION_NUMBER");
          if (
            roleName !== null &&
            roleName !== "null" &&
            locationNum !== null &&
            locationNum !== "null"
          ) {
            // MLC角色 location_number SC 启用创建按钮
            if (
              (roleName === "MLC" && locationNum.substr(0, 1) === "1") ||
              roleName === "SC"
            ) {
              // 取消禁用
              _t.disabledBtn.create = false;
            } else {
              _t.disabledBtn.create = true;
            }
          }
        }
        // 单据录入
        if (item.MENU_ID === "GUID00000000000000000000000000000095") {
          _t.limitBtn.entering = true;
        }
      });
    }
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
