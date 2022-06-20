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
    <div class="marBottom10">
      <el-button
        v-if="limitBtn.create"
        @click="createClick"
        type="primary"
        :disabled="disabledBtn.create"
      >生成长短款</el-button>
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
        :default-sort="{prop: 'issue_name', order: 'descending'}"
      >
        <el-table-column reserve-selection type="selection" fixed align="center" />
        <el-table-column prop="guid" label="单据号" align="center" />
        <el-table-column prop="line_name" label="线路" align="center" />
        <el-table-column prop="station_name" label="车站" align="center" />
        <el-table-column prop="difference_type_name" label="单据类型" align="center" />
        <el-table-column prop="issue_name" label="差异状态" align="center" sortable />
        <el-table-column prop="balance_date" label="运营日期" align="center" sortable />
        <el-table-column prop="difference_amount_yuan" label="金额（元）" align="center" />
        <el-table-column label="操作员ID" width="100" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.difference_operator_name}}</span>
            <span>-</span>
            <span>{{scope.row.difference_operator_id}}</span>
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
      <el-dialog
        :fullscreen="isScreen"
        :visible.sync="dialogFormVisible"
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :before-close="resetChecked"
      >
        <div slot="title" class="dialogTitle clearFix">
          <span class="title">生成长短款</span>
          <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen=!isScreen"></i>
        </div>
        <el-form :model="addEdit" label-width="120px">
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
              <el-form-item label="操作员ID">
                <el-select v-model="addEdit.operator_id" disabled class="widthAll">
                  <el-option
                    v-for="(item,index) in operatorIdListSelect"
                    :key="index"
                    :label="item.USERNAME+'-'+item.USERID"
                    :value="item.USERID"
                  />
                </el-select>
              </el-form-item>
              <el-form-item class="star" label="长款金额(元)">
                <el-input
                  v-model="addEdit.LongMoney"
                  @blur="blurInputUser(addEdit.LongMoney,'longMoneyFlag')"
                  disabled
                />
                <span v-if="errorTip.longMoneyFlag" class="isNotNull">长款金额不能为空</span>
              </el-form-item>
              <el-form-item class="star" label="短款金额(元)">
                <el-input
                  v-model="addEdit.shortMoney"
                  @blur="blurInputUser(addEdit.shortMoney,'shortMoneyFlag')"
                  disabled
                />
                <span v-if="errorTip.shortMoneyFlag" class="isNotNull">短款金额不能为空</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="车站：">
                <el-select v-model="addEdit.station" disabled class="widthAll">
                  <el-option
                    v-for="(item,index) in stationListSelect"
                    :key="index"
                    :label="item.STATION_LOCATION_NAME"
                    :value="item.LOCATION_NUMBER.toString()"
                  />
                </el-select>
              </el-form-item>
              <el-form-item class="star" label="长款数量">
                <el-input
                  v-model="addEdit.LongNumber"
                  @blur="blurInputUser(addEdit.LongNumber,'longNumFlag')"
                  disabled
                />
                <span v-if="errorTip.longNumFlag" class="isNotNull">长款数量不能为空</span>
              </el-form-item>
              <el-form-item class="star" label="短款数量">
                <el-input
                  v-model="addEdit.shortNumber"
                  @blur="blurInputUser(addEdit.shortNumber,'shortNumFlag')"
                  disabled
                />
                <span v-if="errorTip.shortNumFlag" class="isNotNull">短款数量不能为空</span>
              </el-form-item>
              <el-form-item class="star" label="预估长短款">
                <el-input
                  @blur="blurInputUser(addEdit.estimate,'estimateFlag')"
                  v-model="addEdit.estimate"
                  disabled
                />
                <span v-if="errorTip.estimateFlag" class="isNotNull">预估长短款不能为空</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer">
          <el-button @click="resetChecked">取消</el-button>
          <el-button type="primary" @click="addEditData">生成</el-button>
        </div>
      </el-dialog>
    </div>
  </Box>
</template>
<script>
import Box from "../../../components/Box";
import { dateFilter } from "../../../assets/js/filters";

export default {
  components: {
    Box
  },
  name: "profitLengthChange",
  data() {
    return {
      // 放大缩小
      isScreen: false,
      // 弹框车站集合
      stationListSelect: [],
      // 弹框操作员集合
      operatorIdListSelect: [],
      //生成长短款
      addEdit: {
        lines: "", // 线路
        station: "", // 车站
        operator_id: "", // 操作人员
        LongNumber: "", // 长款数量
        shortNumber: "", // 短款数量
        LongMoney: "", // 长款金额
        shortMoney: "", // 短款金额
        estimate: "", // 预估长短款
        totalNum: "", //总数量
        state: "" //状态
      },
      // 生成长短款校验
      errorTip: {
        userFlag: false, // 操作人员
        TimeFlag: false, // 运营日期
        longNumFlag: false, // 长款数量
        shortNumFlag: false, // 短款数量
        longMoneyFlag: false, // 长款金额
        shortMoneyFlag: false, // 短款金额
        estimateFlag: false // 预估长短款
      },
      // 查询表单
      formItem: {
        lines: "", // 线路
        station: "", //车站
        status: "", // 单据状态
        dateTime: [],
        operationId: "" // 操作员id
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
      tableData: [],
      // 生成长短款
      dialogFormVisible: false,
      // 长短款状态集合
      statusList: [],
      // 按钮权限
      limitBtn: {
        queryBtn: false, // 查询
        create: false // 生成长短款
      },
      // 启用禁用按钮
      disabledBtn: {
        create: true // 生成长短款
      },
      //长短款单据状态
      differenceState: "",
      //选中的guid
      selectGuid: []
    };
  },
  methods: {
    // 点击复选框
    selectionChange(row) {
      var _t = this;
      let numLong = 0, //长款数量
        numSmall = 0, //短款数量
        longPrice = 0, //长款金额
        sortPrice = 0, //短款金额
        langSmallMoney = 0; // 预估长短款
      var isErrorNum = 0; // 判断是否是未生成
      var selectedArr = new Array();
      row.forEach(item => {
        console.log(item)
        //用来存放guid的数组
        var obj = new Object();
        obj.guid = item.guid;
        selectedArr.push(obj);
        // 计算长款数量及长款金额
        if (
          item.difference_type_code == "01" ||
          item.difference_type_code == "03" ||
          item.difference_type_code == "05"
        ) {
          numLong++;
          longPrice +=
            item.difference_amount_yuan === null
              ? 0
              : item.difference_amount_yuan === ""
              ? 0
              : item.difference_amount_yuan * 1;
        }
        // 计算短款数量及短款金额
        if (
          item.difference_type_code == "02" ||
          item.difference_type_code == "04" ||
          item.difference_type_code == "06"
        ) {
          numSmall++;
          sortPrice +=
            item.difference_amount_yuan === null ? 0 : item.difference_amount_yuan === "" ? 0 : item.difference_amount_yuan * 1;
        }
        // 计算已生成的表格数据条数
        if (item.issue_code === "1") {
          isErrorNum++;
        }
      });
      _t.selectGuid = selectedArr;
      // 计算预估金额
      langSmallMoney = Math.abs(longPrice - sortPrice);
      // 判断单据类型 给下拉框赋值
      if (longPrice - sortPrice > 0) {
        // 长款
        _t.addEdit.state = "00";
      } else if (longPrice - sortPrice === 0) {
        // 不长不短
        _t.addEdit.state = "02";
      } else {
        //短款
        _t.addEdit.state = "01";
      }
      var roleName = _t.getCookie("USER_TYPE");
      var locationNum = _t.getCookie("LOCATION_NUMBER");
      // 判断是否未生成
      if (
        isErrorNum === 0 &&
        row.length !== 0 &&
        (roleName === "SC" ||
          (roleName === "MLC" && locationNum.substr(0, 1) === "1"))
      ) {
        // 未生成 启用生成长短款按钮(取消禁用)
        // 赋值
        _t.addEdit.LongNumber = numLong;
        _t.addEdit.shortNumber = numSmall;
        _t.addEdit.LongMoney = longPrice.toFixed(2);
        _t.addEdit.shortMoney = sortPrice.toFixed(2);
        _t.addEdit.totalNum = numLong + numSmall;
        _t.addEdit.estimate = langSmallMoney;
        _t.disabledBtn.create = false;
        var location = _t.getCookie("LOCATION_NUMBER"); // 位置编号
        var user_id = _t.getCookie("USER_ID"); // 用户id
        if (location !== null && location !== "null") {
          _t.linesList.forEach(item => {
            if (item.stationList !== null) {
              item.stationList.forEach(val => {
                if (val.LOCATION_NUMBER.toString() === location) {
                  _t.addEdit.lines = item.LINE_LOCATION_NUMBER.toString(); //线路
                  _t.addEdit.station = location; //车站
                  _t.addEdit.operator_id = user_id; //操作员
                  _t.stationListSelect = item.stationList; //车站集合
                  _t.operatorIdListSelect = val.userList; //操作员集合
                }
              });
            }
          });
        }
      } else {
        // 有已生成 继续禁用
        _t.disabledBtn.create = true;
      }
    },
    // 返回row-key
    getRowKey(row) {
      return row.guid;
    },
    // 点击生成长短款
    createClick() {
      var _t = this;
      _t.dialogFormVisible = true;
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
    //生成长短款提交
    addEditData() {
      var _t = this;
      // 校验长款数量
      if (_t.addEdit.LongNumber === null || _t.addEdit.LongNumber === "") {
        _t.errorTip.longNumFlag = true;
      } else {
        _t.errorTip.longNumFlag = false;
      }
      // 校验短款数量
      if (_t.addEdit.shortNumber === null || _t.addEdit.shortNumber === "") {
        _t.errorTip.shortNumFlag = true;
      } else {
        _t.errorTip.shortNumFlag = false;
      }
      // 校验长款金额
      if (_t.addEdit.LongMoney === null || _t.addEdit.LongMoney === "") {
        _t.errorTip.longMoneyFlag = true;
      } else {
        _t.errorTip.longMoneyFlag = false;
      }
      // 校验短款金额
      if (_t.addEdit.shortMoney === null || _t.addEdit.shortMoney === "") {
        _t.errorTip.shortMoneyFlag = true;
      } else {
        _t.errorTip.shortMoneyFlag = false;
      }
      // 校验预估长短款
      if (_t.addEdit.estimate === null || _t.addEdit.estimate === "") {
        _t.errorTip.estimateFlag = true;
      } else {
        _t.errorTip.estimateFlag = false;
      }
      if (
        _t.errorTip.longNumFlag === false &&
        _t.errorTip.shortNumFlag === false &&
        _t.errorTip.longMoneyFlag === false &&
        _t.errorTip.shortMoneyFlag === false &&
        _t.errorTip.estimateFlag === false
      ) {
        var location_number = _t.addEdit.station;
        var user_id = _t.addEdit.operator_id;
        // 提交
        let str =
          "userid=" +
          user_id +
          "&location_number=" +
          location_number +
          "&difference_operator_id=" +
          _t.addEdit.operator_id +
          "&difference_state=" +
          _t.addEdit.state +
          "&difference_total_number=" +
          _t.addEdit.totalNum;
        let Base64 = require("js-base64").Base64;
        let keyToken = _t.$md5(Base64.encode(str));
        let params = {
          userid: user_id, // 用户ID
          location_number: location_number.toString(), // 位置编号
          difference_operator_id: _t.addEdit.operator_id, //操作员编码
          difference_state: _t.addEdit.state, //状态
          difference_total_number: _t.addEdit.totalNum.toString(), //总数量
          difference_total_amount: (_t.addEdit.estimate * 100).toString(), //总金额
          guids: _t.selectGuid,
          token: keyToken //token
        };
        _t.$api.post(
          "/tsGateWay/incomeMoney/createMoneyDifferenceOrderGateWay",
          params,
          function(res) {
            // 操作成功
            if (res.rtCode && res.rtCode === "11008") {
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
    //取消时重置提交单
    resetChecked() {
      var _t = this;
      _t.disabledBtn.create = true;
      _t.dialogFormVisible = false; // 隐藏蒙版
      _t.addEdit.lines = ""; // 线路
      _t.addEdit.station = ""; // 车站
      _t.addEdit.operator_id = ""; // 操作人员
      _t.addEdit.LongNumber = ""; // 长款数量
      _t.addEdit.shortNumber = ""; // 短款数量
      _t.addEdit.LongMoney = ""; // 长款金额
      _t.addEdit.shortMoney = ""; // 短款金额
      _t.addEdit.estimate = ""; // 预估长短款
      _t.$refs.clearSelection.clearSelection();
      _t.errorTip.userFlag = false; // 操作人员
      _t.errorTip.TimeFlag = false; // 运营日期
      _t.errorTip.longNumFlag = false; // 长款数量
      _t.errorTip.shortNumFlag = ""; // 短款数量
      _t.errorTip.longMoneyFlag = false; // 长款金额
      _t.errorTip.shortMoneyFlag = false; // 短款金额
      _t.errorTip.estimateFlag = false; // 预估长短款
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
            location_number_query:
              location_number_query === "" ? null : location_number_query,
            difference_type:
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
            token: keyToken // token
          };
          _t.$api.post(
            "/tsGateWay/incomeMoney/searchMoneyDifferenceRecordsGateWay",
            postData,
            function(res) {
              _t.$store.commit("setLoading", false);
              if (res.rtCode && res.rtCode === "11007") {
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
    //获取状态
    getStatusData() {
      var _t = this;
      let str = "guid=GUID000722201906191621";
      let Base64 = require("js-base64").Base64;
      let keyToken = _t.$md5(Base64.encode(str));
      var params = {
        guid: "GUID000722201906191621",
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
        if (item.MENU_ID === "GUID00000000000000000000000000000089") {
          _t.limitBtn.queryBtn = true;
        }
        // 生成长短款
        if (item.MENU_ID === "GUID00000000000000000000000000000090") {
          _t.limitBtn.create = true;
        }
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
