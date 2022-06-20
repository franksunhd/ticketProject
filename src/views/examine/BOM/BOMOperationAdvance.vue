<template>
  <!--BOM收益预收-->
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
    <!--收益预收-->
    <div class="incomeInAdvance">
      <el-form :model="IncomeInAdvanceFormItem" inline>
        <!--售票员信息-->
        <p class="title">售票员信息</p>
        <div class="formBox-top">
          <el-form-item class="marBottom20 star" label="售票员ID：">
            <el-input
              @blur="blurInput(IncomeInAdvanceFormItem,'userFlag',IncomeInAdvanceFormItem.operatorUser)"
              v-model="IncomeInAdvanceFormItem.operatorUser"
              class="width200"/>
            <span class="isNotNull" v-if="IncomeInAdvanceFormItem.userFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom20" label="密码：">
            <el-input
              @blur="blurInput(IncomeInAdvanceFormItem,'passwordFlag',IncomeInAdvanceFormItem.operatorPassword)"
              v-model="IncomeInAdvanceFormItem.operatorPassword"
              type="password"
              class="width200"/>
            <span class="isNotNull" v-if="IncomeInAdvanceFormItem.passwordFlag">必填项不能为空</span>
          </el-form-item>
          <el-form-item class="marBottom15">
            <el-button type="primary" @click="getIncomeInAdvance">确认</el-button>
          </el-form-item>
        </div>
        <!--控制表格部分显示隐藏-->
        <div v-if="IncomeInAdvanceFormItem.showModule">
          <!--收益金额预收信息-->
          <p class="title">收益金额预收信息</p>
          <div class="formBox-top">
            <el-form-item class="marBottom20" label="操作员收益总金额(元)：">
              <el-input v-model="IncomeInAdvanceFormItem.allMoney" class="width200" disabled/>
            </el-form-item>
            <el-form-item class="marBottom20 star" label="收益预收金额(元)：">
              <el-input
                @blur="ruleMoneyWithTicket(IncomeInAdvanceFormItem,IncomeInAdvanceFormItem.money,'moneyFlag','moneyTip','allMoney')"
                v-model="IncomeInAdvanceFormItem.money"
                class="width200"/>
              <span class="isNotNull"
                    v-if="IncomeInAdvanceFormItem.moneyFlag">{{IncomeInAdvanceFormItem.moneyTip}}</span>
            </el-form-item>
          </div>
          <el-form-item>
            <el-button type="primary" @click="addIncodeInAdvanceData">提交</el-button>
            <el-button type="warning" @click="resetData">取消</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </Box>
</template>

<script>
    import Box from '../../../components/Box';

    export default {
        name: "BOMOperationAdvance",
        components: {Box},
        data() {
            return {
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
                // 收益预收表单
                IncomeInAdvanceFormItem: {
                    operatorUser: '', // 售票员ID
                    operatorPassword: '', // 密码
                    userFlag: false, // 校验售票员标识
                    passwordFlag: false, // 校验密码标识
                    allMoney: '0', // 收益预收总金额
                    money: '', // 预收操作金额
                    moneyFlag: false, // 收益预收标识
                    moneyTip: '', // 收益预收提示
                    showModule: false, // 控制表格区域显示隐藏
                },
            }
        },
        methods: {
            // 取消按钮
            resetData() {
                var _t = this;
                _t.$router.push({name: 'BOMOperation'});
            },
            // 获取单据类型字典
            getStatusData() {
                var _t = this;
                let str = "guid=GUID000722201906191624";
                let Base64 = require("js-base64").Base64;
                let keyToken = _t.$md5(Base64.encode(str));
                var params = {
                    guid: "GUID000722201906191624",
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
                        _t.$alert(res.rtMessage, "温馨提示", {
                            confirmButtonText: "确定",
                            cancelButtonText: "取消"
                        }).then(() => {
                            return false;
                        });
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
            // 失去焦点时校验
            blurInput(item, flag, val) {
                item[flag] = val.trim() === '' ? true : false;
            },
            // 获取收益预收的信息
            getIncomeInAdvance() {
                var _t = this;
                // location_number、操作员id 不为空
                if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
                    // 校验售票员id
                    _t.blurInput(_t.IncomeInAdvanceFormItem, 'userFlag', _t.IncomeInAdvanceFormItem.operatorUser);
                    // 校验售票员密码
                    _t.blurInput(_t.IncomeInAdvanceFormItem, 'passwordFlag', _t.IncomeInAdvanceFormItem.operatorPassword);
                    // 可以提交
                    if (_t.IncomeInAdvanceFormItem.userFlag === false && _t.IncomeInAdvanceFormItem.passwordFlag === false) {
                        let str = "location_number=" + _t.formItem.station
                            + "&bom_operator_id=" + _t.IncomeInAdvanceFormItem.operatorUser.trim()
                            + "&password=" + _t.IncomeInAdvanceFormItem.operatorPassword.trim()
                            + "&bom_creator_id=" + _t.formItem.operationId;
                        let Base64 = require("js-base64").Base64;
                        let keyToken = _t.$md5(Base64.encode(str));
                        var params = {
                            location_number: _t.formItem.station,
                            bom_operator_id: _t.IncomeInAdvanceFormItem.operatorUser.trim(),
                            password: _t.IncomeInAdvanceFormItem.operatorPassword.trim(),
                            bom_creator_id: _t.formItem.operationId,
                            token: keyToken
                        };
                        _t.$api.post('/tsGateWay/bommanager/receivehistoryquery', params, function (res) {
                            if (res.rtCode && res.rtCode === '12009') {
                                _t.IncomeInAdvanceFormItem.showModule = true; // 显示领用记录
                                var resData = res.rtData === null ? {} : res.rtData;
                                _t.IncomeInAdvanceFormItem.allMoney = resData.EARNING_MONEY_NUM !== undefined ? resData.EARNING_MONEY_NUM : 0; // 收益预收总金额
                            } else if (res.rtCode === '22011') {
                                _t.alertDialogTip(_t, res.rtMessage);
                            } else if (res.rtCode) {
                                _t.alertDialogTip(_t, '查询失败!');
                            }
                        });
                    }
                }
            },
            // 提交收益预收金额
            addIncodeInAdvanceData() {
                var _t = this;
                if (_t.formItem.station !== '' && _t.formItem.operationId !== '') {
                    if (_t.IncomeInAdvanceFormItem.showModule) {
                        // 校验售票员id
                        _t.blurInput(_t.IncomeInAdvanceFormItem, 'userFlag', _t.IncomeInAdvanceFormItem.operatorUser);
                        // 校验售票员密码
                        _t.blurInput(_t.IncomeInAdvanceFormItem, 'passwordFlag', _t.IncomeInAdvanceFormItem.operatorPassword);
                        // 校验预收金额
                        _t.ruleMoneyForInCode(_t.IncomeInAdvanceFormItem.money);
                        // 可以提交
                        if (_t.IncomeInAdvanceFormItem.userFlag === false
                            && _t.IncomeInAdvanceFormItem.passwordFlag === false
                            && _t.IncomeInAdvanceFormItem.moneyFlag === false) {
                            // 可以提交
                            let str =
                                "location_number=" + _t.formItem.station
                                + "&bom_operator_id=" + _t.IncomeInAdvanceFormItem.operatorUser.trim()
                                + "&password=" + _t.IncomeInAdvanceFormItem.operatorPassword.trim()
                                + "&bom_creator_id=" + _t.formItem.operationId
                                + "&reserve_money=" + _t.IncomeInAdvanceFormItem.money.trim() * 100;
                            let Base64 = require("js-base64").Base64;
                            let keyToken = _t.$md5(Base64.encode(str));
                            var params = {
                                location_number: _t.formItem.station, // 位置编码
                                bom_operator_id: _t.IncomeInAdvanceFormItem.operatorUser.trim(), // 售票员id
                                password: _t.IncomeInAdvanceFormItem.operatorPassword.trim(), // 密码
                                bom_creator_id: _t.formItem.operationId, // 操作员id
                                reserve_money: _t.IncomeInAdvanceFormItem.money.trim() * 100, // 预收操作金额
                                token: keyToken, // token
                            };
                            _t.$api.post('/tsGateWay/bommanager/earningsadvance', params, function (res) {
                                if (res.rtCode && res.rtCode === '11003') {
                                    _t.$alert(res.rtMessage, "温馨提示", {
                                        confirmButtonText: "确定",
                                        cancelButtonText: "取消"
                                    }).then(() => {
                                        _t.$router.push({name: 'BOMOperation'});
                                    }).catch(() => {
                                        _t.$router.push({name: 'BOMOperation'});
                                    });
                                } else if (res.rtCode) {
                                    _t.alertDialogTip(_t, '操作失败!');
                                }
                            });
                        }
                    } else {
                        _t.alertDialogTip(_t, '请先查询收益余额预收信息!');
                    }
                } else {
                    _t.alertDialogTip(_t, '车站及操作员ID不能为空!');
                }
            },
            // 校验收益预收金额
            ruleMoneyForInCode(val) {
                var _t = this;
                if (val.trim() === '') {
                    _t.IncomeInAdvanceFormItem.moneyFlag = true;
                    _t.IncomeInAdvanceFormItem.moneyTip = '必填项不能为空';
                } else {
                    // 不为空 校验格式
                    var reg = _t.$config.isMoneyNumber();
                    if (reg.test(val.trim()) === false) {
                        _t.IncomeInAdvanceFormItem.moneyFlag = true;
                        _t.IncomeInAdvanceFormItem.moneyTip = '格式不正确';
                    } else {
                        // 格式正确 校验是否大于库存
                        if (val.trim() * 1 > _t.IncomeInAdvanceFormItem.allMoney * 1) {
                            _t.IncomeInAdvanceFormItem.moneyFlag = true;
                            _t.IncomeInAdvanceFormItem.moneyTip = '预收金额不能大于总金额';
                        } else {
                            _t.IncomeInAdvanceFormItem.moneyFlag = false;
                            _t.IncomeInAdvanceFormItem.moneyTip = '';
                        }
                    }
                }
            },
            // 校验金额
            ruleMoneyWithTicket(item, val, flag, tip, all) {
                var _t = this;
                // 校验是否为空
                if (val.trim() === '') {
                    item[flag] = true;
                    item[tip] = '必填项不能为空';
                } else {
                    // 不为空 校验格式
                    var reg = _t.$config.isMoneyNumber();
                    if (reg.test(val.trim()) === false) {
                        item[flag] = true;
                        item[tip] = '格式不正确';
                    } else {
                        // 格式正确 校验是否大于库存
                        if (val.trim() * 1 > item[all] * 1) {
                            item[flag] = true;
                            item[tip] = '操作金额不能大于库存金额';
                        } else {
                            item[flag] = false;
                            item[tip] = '';
                        }
                    }
                }
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
  p.title {
    font-size: 14px;
    margin-bottom: 10px;
  }
</style>
