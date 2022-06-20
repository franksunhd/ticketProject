<template>
  <!--回收-->
  <Box>
    <!--基本信息-->
    <p class="title">基本信息</p>
    <div class="formBox-top">
      <el-form inline :model="formItem">
        <el-form-item class="marBottom15" label="线路：">
          <el-select
            v-model="formItem.lines" disabled>
            <el-option
              v-for="(item,index) in linesList"
              :key="index"
              :label="item.LINE_LOCATION_NAME"
              :value="item.LINE_LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item class="marBottom15" label="车站：">
          <el-select
            v-model="formItem.station" disabled>
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item class="marBottom15" label="操作员ID：">
          <el-select v-model="formItem.operationId" disabled>
            <el-option
              v-for="(item,index) in operatorIdList"
              :key="index"
              :label="item.USERNAME + '-' + item.USERID"
              :value="item.USERID.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item class="marBottom15" label="操作类型：">
          <el-select v-model="formItem.operate_type" disabled>
            <el-option
              v-for="(item,index) in statusList"
              :key="index"
              :label="item.NAME"
              :value="item.VALUE"/>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <!--回收-->
    <div>
      <el-form :model="recycleFormItem" inline>
        <!--售票员信息-->
        <p class="title">售票员信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom20 star" label="售票员ID：">
            <el-input
              class="width200"
              @blur="blurInput(recycleFormItem,'userFlag',recycleFormItem.operatorUser)"
              v-model="recycleFormItem.operatorUser"/>
            <span class="isNotNull" v-if="recycleFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20 star" label="密码：">
            <el-input
              class="width200"
              @blur="blurInput(recycleFormItem,'passwordFlag',recycleFormItem.operatorPassword)"
              v-model="recycleFormItem.operatorPassword"
              type="password"/>
            <span class="isNotNull" v-if="recycleFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20">
            <el-button type="primary" @click="getRecycleData">确认</el-button>
          </el-form-item>
        </div>
        <div v-if="recycleFormItem.showModule">
          <el-row :gutter="100">
            <el-col :span="12">
              <!--装机信息-->
              <p class="title">装机信息</p>
              <el-table :data="recycleTableForLading" border stripe class="marBottom10">
                <el-table-column prop="DEVICE_ID" label="设备编号" header-align="center" align="center"/>
                <el-table-column prop="DEVICE_NAME" label="设备名称" header-align="center" align="center"/>
                <el-table-column prop="MONEY" label="装机金额(元)" header-align="center" align="center"/>
                <el-table-column prop="TICKET_YOUXIAO" label="装票数量(张)" header-align="center" align="center"/>
              </el-table>
            </el-col>
            <el-col :span="12">
              <!--补充信息-->
              <p class="title">补充信息</p>
              <el-table :data="recycleTableForSupplement" border stripe class="marBottom10">
                <el-table-column prop="DEVICE_ID" label="设备编号" header-align="center" align="center"/>
                <el-table-column prop="DEVICE_NAME" label="设备名称" header-align="center" align="center"/>
                <el-table-column prop="MONEY" label="补充金额(元)" header-align="center" align="center"/>
                <el-table-column prop="TICKET_YOUXIAO" label="补票数量(张)" header-align="center" align="center"/>
              </el-table>
            </el-col>
          </el-row>
          <!--清点信息-->
          <p class="title">清点信息</p>
          <el-table :data="recycleTableForMake" border stripe class="marBottom10">
            <el-table-column prop="DEVICE_ID" label="设备编号" header-align="center" align="center"/>
            <el-table-column prop="DEVICE_NAME" label="设备名称" header-align="center" align="center"/>
            <el-table-column prop="MONEY" label="清点金额(元)" header-align="center" align="center"/>
            <el-table-column prop="TICKET_YOUXIAO" label="清点单程票(有效)数量(张)" header-align="center" align="center"/>
            <el-table-column prop="TICKET_WUXIAO" label="清点单程票(无效)数量(张)" header-align="center" align="center"/>
          </el-table>
          <!--回收信息-->
          <p class="title">回收信息</p>
          <el-table :data="recycleTableForRecycle" border stripe class="marBottom10">
            <el-table-column prop="device_name" label="设备名称" header-align="center" align="center"/>
            <el-table-column label="回收金额(元)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.money"/>
              </template>
            </el-table-column>
            <el-table-column label="回收单程票(有效)数量(张)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.ticket_youxiao"/>
              </template>
            </el-table-column>
            <el-table-column label="回收单程票(无效)数量(张)" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input
                  oninput="value=value.replace(/[^\d]/g,'')"
                  v-model="scope.row.ticket_wuxiao"/>
              </template>
            </el-table-column>
            <el-table-column label="备注" header-align="center" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.comment_info"/>
              </template>
            </el-table-column>
          </el-table>
          <el-form-item>
            <el-button type="primary" @click="addRecycleData">提交</el-button>
            <el-button type="warning" @click="resetData">取消</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <!--回收失败错误信息弹出层-->
    <el-dialog
      append-to-body
      :fullscreen="isScreen"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetDetail"
      :visible.sync="dialogDetailVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">温馨提示</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-table :data="detailTable" border stripe class="marBottom20">
        <el-table-column prop="recoverRecord" label="错误信息"/>
      </el-table>
      <div slot="footer">
        <el-button @click="resetDetail">取消</el-button>
        <el-button type="primary" @click="resetDetail">确定</el-button>
      </div>
    </el-dialog>
  </Box>
</template>

<script>
    import Box from "../../../components/Box";

    export default {
        name: "TVMOperationRecycle",
        components: {Box},
        data() {
            return {
                isScreen: false, // 错误提示放大缩小
                // 操作类型
                statusList: [],
                // 线路集合
                linesList: [],
                // 车站集合
                stationList: [],
                // 操作员id集合
                operatorIdList: [],
                // 基本信息表单
                formItem: {
                    lines: '', // 线路
                    station: '', //车站
                    operationId: '', // 操作员id
                    operate_type: '03', // 操作类型
                },
                // 回收表单
                recycleFormItem: {
                    operatorUser: '', // 售票员id
                    operatorPassword: '', // 密码
                    userFlag: false, // 操作员标识
                    passwordFlag: false, // 密码标识
                    showModule: false, // 控制表格区域显示隐藏
                },
                recycleTableForLading: [], // 回收装机信息
                recycleTableForSupplement: [], // 回收补充信息
                recycleTableForMake: [], // 回收清点信息
                recycleTableForRecycle: [], // 回收回收信息
                dialogDetailVisible: false, // 回收错误信息蒙版
                detailTable: [], // 回收错误信息表格
            }
        },
        methods: {
            // 重置错误信息弹出层
            resetDetail() {
                var _t = this;
                _t.dialogDetailVisible = false;
                _t.detailTable = [];
            },
            // 获取单据类型字典
            getStatusData() {
                var _t = this;
                let str = "guid=GUID000722201906191628";
                let Base64 = require("js-base64").Base64;
                let keyToken = _t.$md5(Base64.encode(str));
                var params = {
                    guid: "GUID000722201906191628",
                    token: keyToken
                };
                _t.$api.post("/tsGateWay/ticketUtility/queryDict", params, function (res) {
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
                _t.$api.post("/tsGateWay/ticketUtility/locationCascadeQuery", params, function (res) {
                    // 查到线路信息
                    if (res.rtCode && res.rtCode === "14007") {
                        var linesStationArr = res.rtData === null ? [] : res.rtData;
                        // 处理线路/车站/操作员数据
                        _t.dealWithLinesAndStation(linesStationArr);
                    } else if (res.rtCode) {
                        _t.alertDialogTip(_t, '查询失败');
                    }
                });
            },
            // 处理线路/车站/操作员之间首次加载数据问题
            dealWithLinesAndStation(linesStationArr) {
                var _t = this;
                // 判断角色
                var role = _t.getCookie("USER_TYPE");
                var location = _t.getCookie("LOCATION_NUMBER");
                // 角色和location都不为空
                if (role !== null && role !== "null" && location !== null && location !== "null") {
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
                    }
                }
            },
            // 回收查询表格信息
            getRecycleData() {
                var _t = this;
                // location_number 不为空
                if (_t.formItem.station !== '') {
                    // 校验认证操作员
                    _t.blurInput(_t.recycleFormItem, 'userFlag', _t.recycleFormItem.operatorUser);
                    // 校验密码
                    _t.blurInput(_t.recycleFormItem, 'passwordFlag', _t.recycleFormItem.operatorPassword);
                    // 可以提交
                    if (_t.recycleFormItem.userFlag === false && _t.recycleFormItem.passwordFlag === false) {
                        _t.getRecycle('00'); // 装机
                        _t.getRecycle('01'); // 补充
                        _t.getRecycle('02'); // 清点
                        _t.getRecycle('03'); // 回收

                    }
                }
            },
            // 获取回收信息
            getRecycle(type) {
                var _t = this;
                let str = "location_number=" + _t.formItem.station
                    + "&operate_type=" + type
                    + "&tvm_operator_id=" + _t.recycleFormItem.operatorUser.trim()
                    + "&password=" + _t.recycleFormItem.operatorPassword.trim();
                let Base64 = require("js-base64").Base64;
                let keyToken = _t.$md5(Base64.encode(str));
                var params = {
                    location_number: _t.formItem.station,
                    operate_type: type, // 00 装机 01 补充 02 清点 03 回收
                    tvm_operator_id: _t.recycleFormItem.operatorUser.trim(),
                    password: _t.recycleFormItem.operatorPassword.trim(),
                    token: keyToken
                };
                _t.$api.post('/tsGateWay/tvmManager/getTvmOperationInfo', params, function (res) {
                    if (res.rtCode && res.rtCode === '13010' && type === '00') {
                        // 装机
                        _t.recycleTableForLading = res.rtData === null ? [] : res.rtData;
                    } else if (res.rtCode && res.rtCode === '13011' && type === '01') {
                        // 补充
                        _t.recycleTableForSupplement = res.rtData === null ? [] : res.rtData;
                    } else if (res.rtCode && res.rtCode === '13012' && type === '02') {
                        // 清点
                        _t.recycleTableForMake = res.rtData === null ? [] : res.rtData;
                    } else if (res.rtCode && res.rtCode === '13012' && type === '03') {
                        _t.recycleFormItem.showModule = true; // 显示表格信息
                        // 回收
                        var tableData = new Array();
                        var resData = res.rtData === null ? [] : res.rtData;
                        resData.forEach((item) => {
                            var obj = new Object();
                            obj.device_id = item.DEVICE_ID; // 设备id
                            obj.device_name = item.DEVICE_NAME; // 设备名称
                            obj.money = '0'; // 回收金额
                            obj.ticket_wuxiao = '0'; // 无效数量
                            obj.ticket_youxiao = '0'; // 有效数量
                            obj.comment_info = ''; // 备注
                            tableData.push(obj);
                        });
                        _t.recycleTableForRecycle = tableData;
                    } else if (res.rtCode) {
                        _t.alertDialogTip(_t, '查询失败');
                    }
                });
            },
            // 提交回收信息
            addRecycleData() {
                var _t = this;
                if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
                    if (_t.recycleFormItem.showModule) {
                        // 校验认证操作员
                        _t.blurInput(_t.recycleFormItem, 'userFlag', _t.recycleFormItem.operatorUser);
                        // 校验密码
                        _t.blurInput(_t.recycleFormItem, 'passwordFlag', _t.recycleFormItem.operatorPassword);
                        // 校验表格
                        if (_t.recycleTableForRecycle.length !== 0) {
                            // 表格数据条数不为空 校验金额和数量
                            var errorNum = 0;
                            var regMoney = _t.$config.isMoneyNumber();
                            var regNumber = _t.$config.isNumber();
                            _t.recycleTableForRecycle.forEach((item) => {
                                // 校验回收金额
                                if (item.money.trim() === '' || regMoney.test(item.money.trim()) === false) {
                                    errorNum++;
                                }
                                // 校验有效票数量
                                if (item.ticket_youxiao.trim() === '' || regNumber.test(item.ticket_youxiao.trim()) === false) {
                                    errorNum++;
                                }
                                // 校验无效票数量
                                if (item.ticket_wuxiao.trim() === '' || regNumber.test(item.ticket_wuxiao.trim()) === false) {
                                    errorNum++;
                                }
                            });
                            if (errorNum === 0) {
                                // 错误数量为0 可以提交
                                if (_t.recycleFormItem.userFlag === false
                                    && _t.recycleFormItem.passwordFlag === false) {
                                    let str = "location_number=" + _t.formItem.station
                                        + "&operate_type=" + "03"
                                        + "&tvm_operator_id=" + _t.recycleFormItem.operatorUser.trim()
                                        + "&password=" + _t.recycleFormItem.operatorPassword.trim()
                                        + "&tvm_creator_id=" + _t.formItem.operationId;
                                    let Base64 = require("js-base64").Base64;
                                    let keyToken = _t.$md5(Base64.encode(str));
                                    var params = {
                                        location_number: _t.formItem.station,
                                        operate_type: "03", // 03 回收
                                        tvm_operator_id: _t.recycleFormItem.operatorUser.trim(),
                                        password: _t.recycleFormItem.operatorPassword.trim(),
                                        tvm_creator_id: _t.formItem.operationId,
                                        deviceList: _t.recycleTableForRecycle,
                                        token: keyToken
                                    };
                                    _t.$api.post('/tsGateWay/tvmManager/tvmRecover', params, function (res) {
                                        if (res.rtCode && res.rtCode === '13005') {
                                            _t.$alert(res.rtMessage, "温馨提示", {
                                                confirmButtonText: "确定",
                                                cancelButtonText: "取消"
                                            }).then(() => {
                                                _t.$router.push({name: 'TVMOperation'});
                                            }).catch(() => {
                                                _t.$router.push({name: 'TVMOperation'});
                                            });
                                        } else if (res.rtCode === '23005') {
                                            _t.detailTable = res.rtData === null ? [] : res.rtData;
                                            _t.dialogDetailVisible = true;
                                        } else if (res.rtCode) {
                                            _t.alertDialogTip(_t, '操作失败!');
                                        }
                                    });
                                }
                            } else {
                                // 错误数量不为0 提示
                                _t.alertDialogTip(_t, '请检查回收金额、有效数量及无效数量是否为空或者格式是否正确!');
                            }
                        } else {
                            // 表格数据为空
                            _t.alertDialogTip(_t, '表格数据条数不能为空!');
                        }
                    } else {
                        _t.alertDialogTip(_t, '请先查询回收信息记录!');
                    }
                } else {
                    _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
                }
            },
            // 取消按钮
            resetData() {
                var _t = this;
                _t.$router.push({name: 'TVMOperation'});
            },
            // 失去焦点时校验
            blurInput(item, flag, val) {
                item[flag] = val.trim() === '' ? true : false;
            },
        },
        created() {
            var _t = this;
            var roleName = _t.getCookie('USER_TYPE');
            var locationNum = _t.getCookie('LOCATION_NUMBER');
            if (roleName !== null && roleName !== 'null' && locationNum !== null && locationNum !== 'null') {
                if (roleName === 'SC' || (roleName === 'MLC' && locationNum.substr(0, 1) === '1')) {
                    // 本页面业务逻辑
                    _t.getStatusData();
                    _t.getLinesAndStation();
                }
            }
        }
    }
</script>

<style scoped>

</style>
