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
        <el-form-item label="操作员ID：" class="marBottom7">
          <el-select v-model="formItem.operationId" class="width200">
            <el-option
              v-for="(item,index) in operatorIdList"
              :key="index"
              :label="item.USERNAME + '-' + item.USERID"
              :value="item.USERID.toString()"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="差异状态：" class="marBottom7">
          <el-select v-model="formItem.status" class="width200" clearable>
            <el-option
              v-for="item in statusList"
              :key="item.VALUE"
              :label="item.NAME"
              :value="item.VALUE"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否已补缴：" class="marBottom7">
          <el-select class="width200" v-model="formItem.isName" clearable>
            <el-option
              v-for="item in issueName"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
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
          <el-button type="primary" v-if="limitBtn.queryBtn" @click="getData">查询</el-button>
          <el-button type="warning" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 表格内容 -->
    <div class="tableWp">
      <el-table
        :data="tableData"
        border
        stripe
        :default-sort="{prop: 'difference_state_name', order: 'descending'}"
      >
        <el-table-column prop="order_id" label="单据号" align="center" />
        <el-table-column prop="line_name" label="线路" align="center" />
        <el-table-column prop="station_name" label="车站" align="center" />
        <el-table-column prop="difference_state_name" label="差异状态" align="center" sortable />
        <el-table-column prop="balance_date" label="运营日期" align="center" sortable />
        <el-table-column prop="difference_total_amount_yuan" label="金额（元）" align="center" />
        <el-table-column label="差异者" width="100" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.operator_name}}</span>
            <span>-</span>
            <span>{{scope.row.operator_id}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="issue_name" label="是否已补缴" align="center" />
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="limitBtn.supplement && scope.row.issue == '0' && scope.row.difference_state_code == '01'"
              @click="supplementBtn(scope.row)"
              type="primary"
            >补款</el-button>
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
    <!-- 补款 -->
    <el-dialog
      :fullscreen="isScreen"
      append-to-body
      :before-close="resetData"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogVisible"
    >
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">补款</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen=!isScreen"></i>
      </div>
      <el-form :model="addEdit" ref="addEdit" label-width="100px">
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
            <el-form-item label="差异者：">
              <el-select v-model="addEdit.operationId" class="widthAll" disabled>
                <el-option
                  v-for="(item,index) in operatorIdList"
                  :key="index"
                  :label="item.USERNAME + '-' + item.USERID"
                  :value="item.USERID.toString()"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="短款金额：" class="star">
              <el-input
                placeholder="请输入短款金额"
                v-model="addEdit.shortMoney"
                maxlength="9"
                @blur="blurInputUser(addEdit.shortMoney,'shortMoneyFlag');shortLoseFocus()"
              />
              <span class="isNotNull" v-if="errorTip.shortMoneyFlag">短款金额不能为空</span>
            </el-form-item>
            <el-form-item label="认证操作员1" class="star">
              <el-input
                placeholder="请输入操作员id1"
                @blur="blurInputUser(addEdit.identified_operator_id1,'userFlag1')"
                v-model="addEdit.identified_operator_id1"
              />
              <span v-if="errorTip.userFlag1" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item label="认证操作员2" class="star">
              <el-input
                placeholder="请输入操作员id2"
                @blur="blurInputUser(addEdit.identified_operator_id2,'userFlag2')"
                v-model="addEdit.identified_operator_id2"
              />
              <span v-if="errorTip.userFlag2" class="isNotNull">必填项不能为空</span>
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
            <!-- 此标签只用来占位，没有其他用途 -->
            <el-form-item class="visibility" label="占位隐藏：">
              <el-input v-model="addEdit.inLocation"></el-input>
            </el-form-item>
            <el-form-item label="补款金额：" class="star">
              <el-input
                maxlength="9"
                placeholder="请输入补款金额"
                v-model="addEdit.repairMoney"
                @blur="blurInputUser(addEdit.repairMoney,'repairMoneyFlag');mendLoseFocus()"
              />
              <span class="isNotNull" v-if="errorTip.repairMoneyFlag">补款金额不能为空</span>
            </el-form-item>
            <el-form-item label="密码：" class="star">
              <el-input
                placeholder="请输入密码"
                v-model="addEdit.password"
                type="password"
                maxlength="12"
                @blur="blurInputUser(addEdit.password,'passwordFlag')"
              />
              <span class="isNotNull" v-if="errorTip.passwordFlag">密码不能为空</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="resetData">取消</el-button>
        <el-button type="primary" @click="addEditData">补款</el-button>
      </div>
    </el-dialog>
  </Box>
</template>
<script>
import Box from "../../../components/Box";
import { dateFilter } from "../../../assets/js/filters";

export default {
  components: {
    Box
  },
  name: "profitLengthBills",
  data() {
    return {
      // 放大缩小
      isScreen: false,
      // 是否已补缴
      issueName: [
        {
          id: "0",
          name: "未补缴"
        },
        {
          id: "1",
          name: "已补缴"
        }
      ],
      //补款
      addEdit: {
        lines: "", // 线路
        station: "", // 车站
        operationId: "", // 操作人员
        shortMoney: "", // 短款金额
        shortMoneyFocus: "", //短款金额失去焦点
        repairMoney: "", // 补款金额
        repairMoneyFocus: "", //补款金额失去焦点
        identified_operator_id1: "", // 认证操作员1
        identified_operator_id2: "", // 认证操作员2
        password: "" //密码
      },
      // 补款校验
      errorTip: {
        shortMoneyFlag: false, // 短款金额校验
        repairMoneyFlag: false, // 补款金额校验
        userFlag1: false, // 校验操作员1
        userFlag2: false, // 校验操作员2
        passwordFlag: false // 校验密码
      },
      //补款
      dialogVisible: false,
      // 查询表单
      formItem: {
        lines: "", // 线路
        station: "", //车站
        status: "", // 单据状态
        dateTime: [],
        operationId: "", // 操作员id
        isName: "" // 是否已补缴
      },
      // 分页
      options: {
        total: 0, // 总条数
        currentPage: 1, // 当前页码
        pageSize: 10 // 显示条数
      },
      // 操作员id集合
      operatorIdList: [],
      // 线路集合
      linesList: [],
      // 车站集合
      stationList: [],
      //表格数据
      tableData: [],
      // 长短款状态集合
      statusList: [],
      // 按钮权限
      limitBtn: {
        queryBtn: false, // 查询
        supplement: false // 补款
      },
      //提交需要的参数
      parsmsData: {
        guid: ""
      },
      //点击每一行的数据
      listData: []
    };
  },
  methods: {
    // 短款金额失去焦点自动保留两位小数
    shortLoseFocus() {
      var _t = this;
      if (_t.addEdit.shortMoney.trim() == "") {
        _t.addEdit.shortMoney = "";
      } else {
        _t.addEditshortMoneyFocus = _t.addEdit.shortMoney;
        _t.addEdit.shortMoney = (_t.addEditshortMoneyFocus * 1).toFixed(2);
      }
    },
    // 补款金额失去焦点自动保留两位小数
    mendLoseFocus() {
      var _t = this;
      if(_t.addEdit.repairMoney.trim() == ""){
        _t.addEdit.repairMoney = "";
      }else{
        _t.addEdit.repairMoneyFocus = _t.addEdit.repairMoney;
        _t.addEdit.repairMoney = (_t.addEdit.repairMoneyFocus*1).toFixed(2);
      }
    },
    // repairMoney: "", // 补款金额
    // repairMoneyFocus: "", //补款金额失去焦点
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
    // 查询按钮
    getData() {
      var _t = this;
      var role = _t.getCookie("USER_TYPE"); // 角色
      var location = _t.getCookie("LOCATION_NUMBER"); // 位置编号
      var user_id = _t.getCookie("USER_ID"); // 用户id
      var location_number = ""; // 发送请求的 位置编号
      var location_number_query = ""; // 发送请求的 query
      var operator_id = ""; // 操作员id
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
          // 车站为空 操作员必为空
          if (_t.formItem.station === "") {
            location_number = location;
            operator_id = user_id;
          } else {
            // 车站有值
            location_number = _t.formItem.station;
            // 操作员为空
            if (_t.formItem.operationId === "") {
              operator_id = user_id;
            } else {
              // 操作员不为空
              operator_id = _t.formItem.operationId;
            }
          }
        } else if (role === "MLC" && location.substr(0, 1) === "3") {
          // 线路为空 操作员id必为空
          if (_t.formItem.lines === "") {
            location_number = location;
            operator_id = user_id;
          } else {
            // 线路不为空
            if (_t.formItem.station === "") {
              // 车站为空 操作员必为空
              location_number = _t.formItem.lines;
              operator_id = user_id;
            } else {
              // 车站不为空
              if (_t.formItem.operationId === "") {
                // 操作员为空
                location_number = _t.formItem.lines;
                location_number_query = _t.formItem.station;
                operator_id = user_id;
              } else {
                // 操作员不为空
                location_number = _t.formItem.lines;
                operator_id = _t.formItem.operationId;
                location_number_query = _t.formItem.station;
              }
            }
          }
        }
        if (location_number !== "" && operator_id !== "") {
          let str = "userid=" + user_id + "&location_number=" + location_number;
          let Base64 = require("js-base64").Base64;
          let keyToken = _t.$md5(Base64.encode(str));
          let postData = {
            userid: user_id, // 操作员id
            location_number: location_number, // 位置编码
            difference_operator_id: user_id, //差异者编号
            location_number_query:
              location_number_query === "" ? null : location_number_query,
            difference_state:
              _t.formItem.status === "" ? null : _t.formItem.status, // 状态
            create_dt_begin:
              _t.formItem.dateTime !== null
                ? _t.formItem.dateTime[0] !== undefined
                  ? dateFilter(_t.formItem.dateTime[0].getTime())
                  : null
                : null, // 开始时间
            create_dt_end:
              _t.formItem.dateTime !== null
                ? _t.formItem.dateTime[1] !== undefined
                  ? dateFilter(_t.formItem.dateTime[1].getTime())
                  : null
                : null, // 结束时间
            pageNum: _t.options.currentPage, // 当前页
            pageSize: _t.options.pageSize, //每页显示条数
            issue: _t.formItem.isName === "" ? null : _t.formItem.isName,
            token: keyToken // token
          };
          _t.$api.post(
            "/tsGateWay/incomeMoney/searchMoneyDifferenceOrderGateWay",
            postData,
            function(res) {
              _t.$store.commit("setLoading", false);
              if (res.rtCode && res.rtCode === "11010") {
                _t.tableData = res.rtData === null ? [] : res.rtData;
                _t.options.total = res.totalCount ? res.totalCount : 0;
              } else if (res.rtCode) {
                _t.alertDialogTip(_t, "查询失败!");
              }
            }
          );
        }
      }
    },
    // 重置查询按钮
    resetQuery() {},
    //点击补款
    supplementBtn(row) {
      var _t = this;
      _t.dialogVisible = true;
      _t.listData = row;
      _t.parsmsData.guid = _t.listData.guid;
      var location = _t.getCookie("LOCATION_NUMBER"); // 位置编号
      var user_id = _t.getCookie("USER_ID"); // 用户id
      if (location !== null && location !== "null") {
        _t.linesList.forEach(item => {
          if (item.stationList !== null) {
            item.stationList.forEach(val => {
              if (val.LOCATION_NUMBER.toString() === location) {
                _t.addEdit.lines = item.LINE_LOCATION_NUMBER.toString();
                _t.addEdit.station = location;
                _t.addEdit.operationId = user_id;
              }
            });
          }
        });
      }
    },
    // 提交单校验
    blurInputUser(val, flag) {
      var _t = this;
      if (val.trim() === "") {
        _t.errorTip[flag] = true;
      } else {
        _t.errorTip[flag] = false;
      }
    },
    // 补款提交
    addEditData() {
      var _t = this;
      // 校验短款金额
      if (_t.addEdit.shortMoney === null || _t.addEdit.shortMoney === "") {
        _t.errorTip.shortMoneyFlag = true;
      } else {
        _t.errorTip.shortMoneyFlag = false;
      }
      // 校验补款金额
      if (_t.addEdit.repairMoney === null || _t.addEdit.repairMoney === "") {
        _t.errorTip.repairMoneyFlag = true;
      } else {
        _t.errorTip.repairMoneyFlag = false;
      }
      // 校验密码
      if (_t.addEdit.password === null || _t.addEdit.password === "") {
        _t.errorTip.passwordFlag = true;
      } else {
        _t.errorTip.passwordFlag = false;
      }
      //认证操作员1
      if (
        _t.addEdit.identified_operator_id1 === null ||
        _t.addEdit.identified_operator_id1 === ""
      ) {
        _t.errorTip.userFlag1 = true;
      } else {
        _t.errorTip.userFlag1 = false;
      }
      //认证操作员2
      if (
        _t.addEdit.identified_operator_id2 === null ||
        _t.addEdit.identified_operator_id2 === ""
      ) {
        _t.errorTip.userFlag2 = true;
      } else {
        _t.errorTip.userFlag2 = false;
      }
      if (
        _t.errorTip.passwordFlag === false &&
        _t.errorTip.shortMoneyFlag === false &&
        _t.errorTip.userFlag1 === false &&
        _t.errorTip.userFlag2 === false
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
          _t.parsmsData.guid +
          "&fill_money=" +
          _t.addEdit.repairMoney * 100 +
          "&identified_operator_id1=" +
          _t.addEdit.identified_operator_id1 +
          "&identified_operator_id2=" +
          _t.addEdit.identified_operator_id2 +
          "&identified_operator_password2=" +
          _t.addEdit.password;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        let params = {
          userid: user_id, // 用户ID
          location_number: location_number.toString(), // 位置编号
          guid: _t.parsmsData.guid, // 长短款单据订单号
          fill_money: _t.addEdit.repairMoney * 100, //补款金额
          identified_operator_id1: _t.addEdit.identified_operator_id1, //认证操作员1
          identified_operator_id2: _t.addEdit.identified_operator_id2, //认证操作员2
          identified_operator_password2: _t.addEdit.password, //认证密码
          token: keyToken //token
        };
        _t.$api.post(
          "/tsGateWay/incomeMoney/fillMoneyDifferenceOrderGateWay",
          params,
          function(res) {
            // 操作成功
            if (res.rtCode && res.rtCode === "11013") {
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
            } else {
              _t.alertDialogTip(_t, "操作失败!");
            }
          }
        );
      }
    },
    //取消时重置补款
    resetData() {
      var _t = this;
      _t.dialogVisible = false;
      _t.addEdit.lines = ""; // 线路
      _t.addEdit.station = ""; // 车站
      _t.addEdit.operator_id = ""; // 操作人员
      _t.addEdit.shortMoney = ""; // 短款金额
      _t.addEdit.repairMoney = ""; // 补款金额
      _t.addEdit.identified_operator_id1 = ""; // 认证操作员1
      _t.addEdit.identified_operator_id2 = ""; // 认证操作员2
      _t.addEdit.password = ""; //密码
      _t.errorTip.shortMoneyFlag = false; // 短款金额校验
      _t.errorTip.repairMoneyFlag = false; // 补款金额校验
      _t.errorTip.userFlag1 = false; // 校验操作员1
      _t.errorTip.userFlag2 = false; // 校验操作员2
      _t.errorTip.passwordFlag = false; // 校验密码
    },
    //获取状态
    getStatusData() {
      var _t = this;
      let str = "guid=GUID000722201906191623";
      let Base64 = require("js-base64").Base64;
      let keyToken = _t.$md5(Base64.encode(str));
      var params = {
        guid: "GUID000722201906191623",
        token: keyToken
      };
      _t.$api.post("/tsGateWay/ticketUtility/queryDict", params, function(res) {
        // 查询成功
        if (res.rtCode && res.rtCode === "14010") {
          _t.statusList = res.rtData === null ? [] : res.rtData;
        }
      });
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
          _t.getLinesAndStation();
        }
      });
      // 判断权限按钮
      limitBtnArr.forEach(item => {
        // 查询
        if (item.MENU_ID === "MENU20190903142840TcEubpZutrRMin") {
          _t.limitBtn.queryBtn = true;
        }
        // 补款
        if (item.MENU_ID === "MENU20190903142821GPxnXANZZjjFaA") {
          _t.limitBtn.supplement = true;
        }
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
