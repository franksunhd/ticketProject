<template>
  <Box>
    <!--  MLC角色 3开头  -->
    <div v-if="isMLC === true">
      <!--  若干车站长短款记录  -->
      <div v-if="limitBtn.stationMoney" class="marBottom50">
        <p class="title">若干车站长短款记录</p>
        <div id="moneyRecordMLC" class="eCharts"></div>
      </div>
      <!--  若干车站车票、备用金、收益库存  -->
      <div v-if="limitBtn.stationNumber" class="marBottom50">
        <p class="title">若干车站车票、备用金、收益库存</p>
        <div id="inventoryMLC" class="eCharts"></div>
      </div>
      <ul class="home_list clearFix">
        <li v-if="limitBtn.BOMInfo">
          <!--  待审核BOM单据  -->
          <p class="title">待审核BOM单据</p>
          <el-table class="isNotBtnTable" :data="BOMData" border>
            <el-table-column prop="STATION_NAME" label="位置/车站"/>
            <el-table-column prop="ORDER_ID" label="单据号"/>
            <el-table-column prop="OPERATE_TYPE_NAME" label="单据类型"/>
          </el-table>
          <div class="tr">
            <el-button type="text" @click="clickMore('BOM')">查看更多...</el-button>
          </div>
        </li>
        <!--  待审核TVM单据  -->
        <li v-if="limitBtn.TVMInfo">
          <p class="title">待审核TVM单据</p>
          <el-table class="isNotBtnTable" :data="TVMData" border>
            <el-table-column prop="STATION_NAME" label="位置/车站"/>
            <el-table-column prop="ORDER_ID" label="单据号"/>
            <el-table-column prop="OPERATE_TYPE_NAME" label="单据类型"/>
          </el-table>
          <div class="tr">
            <el-button type="text" @click="clickMore('TVM')">查看更多...</el-button>
          </div>
        </li>
        <!--  当前位置短款单据  -->
        <li v-if="limitBtn.shortBill">
          <p class="title">当前位置短款单据</p>
          <el-table class="isNotBtnTable" :data="shortData" border>
            <el-table-column prop="station_name" label="位置/车站"/>
            <el-table-column prop="guid" label="单据号"/>
            <el-table-column prop="difference_total_amount_yuan" label="金额"/>
            <el-table-column prop="issue_name" label="单据状态"/>
          </el-table>
          <div class="tr">
            <el-button type="text" @click="clickMore('shortage')">查看更多...</el-button>
          </div>
        </li>
        <!--  当前位置若干车票调配单据  -->
        <li v-if="limitBtn.ticketWith">
          <p class="title">当前位置若干车票调配单据</p>
          <el-table class="isNotBtnTable" :data="ticketData" border>
            <el-table-column prop="ORDER_ID" label="单据号"/>
            <el-table-column prop="IMPORT_STATION_NAME" label="调入位置"/>
            <el-table-column prop="EXPORT_STATION_NAME" label="调出位置"/>
            <el-table-column prop="ORDER_STATE_NAME" label="单据状态"/>
          </el-table>
          <div class="tr">
            <el-button type="text" @click="clickMore('ticketTransfers')">查看更多调拨单...</el-button>
            <el-button type="text" @click="clickMore('ticketHandIn')">查看更多上交单...</el-button>
            <el-button type="text" @click="clickMore('ticketWith')">查看更多配发单...</el-button>
          </div>
        </li>
        <!--  当前位置备用金调配单据  -->
        <li v-if="limitBtn.moneyWith">
          <p class="title">当前位置备用金调配单据</p>
          <el-table class="isNotBtnTable" :data="moneyData" border>
            <el-table-column prop="ORDER_ID" label="单据号"/>
            <el-table-column prop="IMPORT_STATION_NAME" label="调入位置"/>
            <el-table-column prop="EXPORT_STATION_NAME" label="调出位置"/>
            <el-table-column prop="ORDER_TYPE_NAME" label="单据类型"/>
          </el-table>
          <div class="tr">
            <el-button type="text" @click="clickMore('standMoneyWith')">查看更多配发单...</el-button>
            <el-button type="text" @click="clickMore('standMoneyHandIn')">查看更多上交单...</el-button>
            <el-button type="text" @click="clickMore('standMoneyRecycle')">查看更多回收单...</el-button>
          </div>
        </li>
      </ul>
    </div>
    <!--SC 或者 MLC 1开头-->
    <div v-if="isMLC === false">
      <div class="displayFlexRow">
        <div class="flex_1 borderRight paddingRight20">
          <div v-if="limitBtn.BOMInfo" class="marBottom50">
            <!--  待审核BOM单据  -->
            <p class="title">待审核BOM单据</p>
            <el-table class="isNotBtnTable" :data="BOMData" border>
              <el-table-column prop="STATION_NAME" label="位置/车站"/>
              <el-table-column prop="ORDER_ID" label="单据号"/>
              <el-table-column prop="OPERATE_TYPE_NAME" label="单据类型"/>
            </el-table>
            <div class="tr">
              <el-button type="text" @click="clickMore('BOM')">查看更多...</el-button>
            </div>
          </div>
          <!--  待审核TVM单据  -->
          <div v-if="limitBtn.TVMInfo">
            <p class="title">待审核TVM单据</p>
            <el-table class="isNotBtnTable" :data="TVMData" border>
              <el-table-column prop="STATION_NAME" label="位置/车站"/>
              <el-table-column prop="ORDER_ID" label="单据号"/>
              <el-table-column prop="OPERATE_TYPE_NAME" label="单据类型"/>
            </el-table>
            <div class="tr">
              <el-button type="text" @click="clickMore('TVM')">查看更多...</el-button>
            </div>
          </div>
        </div>
        <div class="flex_2 paddingLeft20 paddingRight20">
          <!--  若干车站长短款记录  -->
          <div v-if="limitBtn.stationMoney" class="marBottom50">
            <p class="title">若干车站长短款记录</p>
            <div id="moneyRecordSC" class="eCharts"></div>
          </div>
          <!--  若干车站车票、备用金、收益库存  -->
          <div v-if="limitBtn.stationNumber">
            <p class="title">若干车站车票、备用金、收益库存</p>
            <div id="inventorySC" class="eCharts"></div>
          </div>
        </div>
        <div class="flex_1 borderLeft paddingLeft20">
          <!--  当前位置短款单据  -->
          <div v-if="limitBtn.shortBill" class="marBottom50">
            <p class="title">当前位置短款单据</p>
            <el-table class="isNotBtnTable" :data="shortData" border>
              <el-table-column prop="station_name" label="位置/车站"/>
              <el-table-column prop="guid" label="单据号"/>
              <el-table-column prop="difference_total_amount_yuan" label="金额"/>
              <el-table-column prop="issue_name" label="单据状态"/>
            </el-table>
            <div class="tr">
              <el-button type="text" @click="clickMore('shortage')">查看更多...</el-button>
            </div>
          </div>
          <!--  当前位置若干车票调配单据  -->
          <div v-if="limitBtn.ticketWith" class="marBottom50">
            <p class="title">当前位置若干车票调配单据</p>
            <el-table class="isNotBtnTable" :data="ticketData" border>
              <el-table-column prop="ORDER_ID" label="单据号"/>
              <el-table-column prop="IMPORT_STATION_NAME" label="调入位置"/>
              <el-table-column prop="EXPORT_STATION_NAME" label="调出位置"/>
              <el-table-column prop="ORDER_STATE_NAME" label="单据状态"/>
            </el-table>
            <div class="tr">
              <el-button type="text" @click="clickMore('ticketTransfers')">查看更多调拨单...</el-button>
              <el-button type="text" @click="clickMore('ticketHandIn')">查看更多上交单...</el-button>
              <el-button type="text" @click="clickMore('ticketWith')">查看更多配发单...</el-button>
            </div>
          </div>
          <!--  当前位置备用金调配单据  -->
          <div v-if="limitBtn.moneyWith">
            <p class="title">当前位置备用金调配单据</p>
            <el-table class="isNotBtnTable" :data="moneyData" border>
              <el-table-column prop="ORDER_ID" label="单据号"/>
              <el-table-column prop="IMPORT_STATION_NAME" label="调入位置"/>
              <el-table-column prop="EXPORT_STATION_NAME" label="调出位置"/>
              <el-table-column prop="ORDER_TYPE_NAME" label="单据类型"/>
            </el-table>
            <div class="tr">
              <el-button type="text" @click="clickMore('standMoneyWith')">查看更多配发单...</el-button>
              <el-button type="text" @click="clickMore('standMoneyHandIn')">查看更多上交单...</el-button>
              <el-button type="text" @click="clickMore('standMoneyRecycle')">查看更多回收单...</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Box>
</template>

<script>
    import Box from '../components/Box';
    import {dateFilterThisDay} from "../assets/js/filters";

    export default {
        name: "Home",
        components: {Box},
        data() {
            return {
                // 位置表单
                formItem: {
                    OPERATOR_ID: this.getCookie('USER_ID'), // 工号
                    OPERATOR_NAME: this.getCookie('USER_NAME'), // 姓名
                },
                // 待审核BOM单据
                BOMData: [],
                // 待审核TVM单据
                TVMData: [],
                // 当前位置长短款单据
                shortData: [],
                // 若干车票调配单据
                ticketData: [],
                // 若干备用金调配单据
                moneyData: [],
                // 区域权限
                limitBtn: {
                    BOMInfo: false, // BOM单据
                    TVMInfo: false, // TVM单据
                    stationMoney: false, // 若干车站长短款记录
                    stationNumber: false, // 若干车站车票、备用金、收益库存
                    shortBill: false, // 当前位置短款单据
                    ticketWith: false, // 当前位置车票调配单据
                    moneyWith: false, // 当前位置备用金调配单据
                },
                // 布局结构
                isMLC: '', // MLC一种, SC一种
                // 若干车站长短款记录
                optionsMoney: {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    legend: {
                        data: ['BOM长款', 'BOM短款', 'TVM长款', 'TVM短款', '收益长款', '收益短款']
                    },
                    color: ["#EAEA26", "#906BF9", "#FE5656", "#01E17E", "#3DD1F9", "#FFAD05"],
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        data: ['巴西', '印尼', '美国', '印度', '中国']

                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [
                        {
                            name: 'BOM长款',
                            type: 'bar',
                            data: [1, 2, 3, 4, 5]
                        },
                        {
                            name: 'BOM短款',
                            type: 'bar',
                            data: [2, 3, 4, 5, 6]
                        },
                        {
                            name: 'TVM长款',
                            type: 'bar',
                            data: [3, 4, 5, 6, 7]
                        },
                        {
                            name: 'TVM短款',
                            type: 'bar',
                            data: [4, 5, 6, 7, 8]
                        },
                        {
                            name: '收益长款',
                            type: 'bar',
                            data: [5, 6, 7, 8, 9]
                        },
                        {
                            name: '收益短款',
                            type: 'bar',
                            data: [6, 7, 8, 9, 10]
                        }
                    ]
                },
                // 若干车站库存
                optionsInventory: {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    legend: {
                        data: ['车票库存', '备用金库存', '收益库存']
                    },
                    color: ['#546ef3', '#a6cb09', '#f8bd00'],
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        data: ['巴西', '印尼', '美国', '印度', '中国']

                    },
                    yAxis: {
                        type: 'value',
                    },
                    series: [
                        {
                            name: '车票库存',
                            type: 'bar',
                            data: [1, 2, 3, 4, 5]
                        },
                        {
                            name: '备用金库存',
                            type: 'bar',
                            data: [2, 3, 4, 5, 6]
                        },
                        {
                            name: '收益库存',
                            type: 'bar',
                            data: [3, 4, 5, 6, 7]
                        }
                    ]
                },
                // 从cookie中获取
                cookieMap: {
                    location_number: this.getCookie('LOCATION_NUMBER'),
                    role: this.getCookie('USER_TYPE'),
                }
            }
        },
        methods: {
            // 获取接口数据
            getData(limitBtnArr) {
                var _t = this;
                _t.$store.commit('setLoading', false);
                // 区域权限
                limitBtnArr.forEach((item) => {
                    // 待审核BOM单据
                    if (item.MENU_ID === "MENU20190903105902iftkYmLoivdbXu") {
                        _t.limitBtn.BOMInfo = true; // BOM单据
                    }
                    // 待审核TVM单据
                    if (item.MENU_ID === "MENU20190903105927lWNnpTAIkaNILd") {
                        _t.limitBtn.TVMInfo = true; // TVM单据
                    }
                    // 若干车站长短款记录
                    if (item.MENU_ID === "MENU20190903110434weRIFLpghCCKJV") {
                        _t.limitBtn.stationMoney = true; // 若干车站长短款记录
                    }
                    // 车票备用金收益库存
                    if (item.MENU_ID === "MENU20190903110509mTTBmHpPaCyLfi") {
                        _t.limitBtn.stationNumber = true; // 若干车站车票、备用金、收益库存
                    }
                    // 当前位置短款单据
                    if (item.MENU_ID === "MENU20190903110538cIwJQhnuBQbdOh") {
                        _t.limitBtn.shortBill = true; // 当前位置短款单据
                    }
                    // 若干位置车票调用单据
                    if (item.MENU_ID === "MENU20190903110616ydhAWDDHUVgExc") {
                        _t.limitBtn.ticketWith = true; // 当前位置车票调配单据
                    }
                    // 若干位置备用金调配单据
                    if (item.MENU_ID === "MENU20190903110641WXIdanLItHjdVJ") {
                        _t.limitBtn.moneyWith = true; // 当前位置备用金调配单据
                    }
                });
                // 处理调用的接口以及显示页面的方式
                _t.dealDataAndDrawPage();
            },
            // 处理调用的接口以及显示页面的方式
            dealDataAndDrawPage() {
                var _t = this;
                // 判断是MLC登录还是SC登录从而判断加载哪种布局结构
                var user_type = _t.cookieMap.role;
                var location_number = _t.cookieMap.location_number;
                if (user_type === 'SC'
                    || (user_type === 'MLC'
                        && location_number.toString().substr(0, 1) === '1')) {
                    _t.isMLC = false;
                } else if (user_type === 'MLC' && location_number.toString().substr(0, 1) === '3') {
                    _t.isMLC = true;
                } else {
                    _t.isMLC = '';
                }
                // 查询待审核BOM单据
                if (_t.limitBtn.BOMInfo) {
                    _t.getAuditBOMData(location_number, _t.formItem.OPERATOR_ID);
                }
                // 查询待审核TVM单据
                if (_t.limitBtn.TVMInfo) {
                    _t.getAuditTVMData(location_number, _t.formItem.OPERATOR_ID);
                }
                // 查询若干车站长短款记录
                if (_t.limitBtn.stationMoney) {
                    _t.getStationMoneyRecord();
                }
                // 查询若干车站车票、备用金、收益库存
                if (_t.limitBtn.stationNumber) {
                    _t.getStationInventoryRecord();
                }
                // 查询当前位置短款单据
                if (_t.limitBtn.shortBill) {
                    _t.getShortData(location_number, _t.formItem.OPERATOR_ID);
                }
                // 查询当前位置车票调配单据
                if (_t.limitBtn.ticketWith) {
                    _t.getTicketWithData(location_number, _t.formItem.OPERATOR_ID);
                }
                // 查询当前位置备用金调配单据
                if (_t.limitBtn.moneyWith) {
                    _t.getMoneyWithData(location_number, _t.formItem.OPERATOR_ID);
                }
            },
            // 点击查看更多
            clickMore(flag) {
                var _t = this;
                if (flag === 'BOM') {
                    // 待审核BOM单据
                    _t.$router.push({name: "BOMOperation"});
                } else if (flag === 'TVM') {
                    // 待审核TVM单据
                    _t.$router.push({name: "TVMOperation"});
                } else if (flag === 'shortage') {
                    // 短款
                    _t.$router.push({name: "profitLengthBills"});
                } else if (flag === 'ticketTransfers') {
                    // 车票调拨单
                    _t.$router.push({name: "ticketTransfers"});
                } else if (flag === 'ticketHandIn') {
                    // 车票上交单
                    _t.$router.push({name: "ticketUpper"});
                } else if (flag === 'ticketWith') {
                    // 车票配发单
                    _t.$router.push({name: "ticketAllotment"});
                } else if (flag === 'standMoneyWith') {
                    // 备用金配发单
                    _t.$router.push({name: "spareAllotment"});
                } else if (flag === 'standMoneyHandIn') {
                    // 备用金上交单
                    _t.$router.push({name: "spareUpper"});
                } else if (flag === 'standMoneyRecycle') {
                    // 备用金回收单
                    _t.$router.push({name: "spareRecycle"});
                }
            },
            // 获取待审核BOM表格
            getAuditBOMData(location_number, operator_id) {
                var _t = this;
                var params = {
                    location_number: location_number, // 位置
                    bom_operator_id: operator_id, // 操作员id
                    order_id: null, // 单据号
                    operate_type: null, // 单据类型
                    operate_state: '01', // 单据状态 01待审核
                    start_dt: dateFilterThisDay(new Date().getTime()), // 开始时间
                    end_dt: null, // 结束时间
                    pageNum: 1, // 当前页
                    pageSize: 5, //每页显示条数
                };
                _t.$api.post("/tsGateWay/bommanager/operationListQuery", params, function (res) {
                    if (res.rtCode && res.rtCode === "12006") {
                        _t.BOMData = res.rtData === null ? [] : res.rtData;
                    } else if (res.rtCode) {
                        _t.BOMData = [];
                    }
                });
            },
            // 获取待审核TVM表格
            getAuditTVMData(location_number, operator_id) {
                var _t = this;
                let params = {
                    location_number: location_number, // 位置
                    tvm_creator_id: operator_id, // 操作员id
                    order_id: null, // 单据号
                    operate_type: null, // 单据类型
                    operate_state: '01', // 单据状态 01待审核
                    start_dt: dateFilterThisDay(new Date().getTime()), // 开始时间
                    end_dt: null, // 结束时间
                    pageNum: 1, // 当前页
                    pageSize: 5, //每页显示条数
                };
                _t.$api.post("/tsGateWay/tvmManager/getOperationOrder", params, function (res) {
                    if (res.rtCode && res.rtCode === "13006") {
                        _t.TVMData = res.rtData === null ? [] : res.rtData;
                    } else if (res.rtCode) {
                        _t.TVMData = [];
                    }
                });
            },
            // 获取若干车站长短款记录
            getStationMoneyRecord() {
                var _t = this;
                _t.$nextTick(function () {
                    var myECharts;
                    if (_t.isMLC === true) {
                        myECharts = _t.$echarts.init(document.getElementById('moneyRecordMLC'));
                    } else if (_t.isMLC === false) {
                        myECharts = _t.$echarts.init(document.getElementById('moneyRecordSC'));
                    } else {
                        myECharts = '';
                    }
                    if (myECharts !== '') {
                        myECharts.setOption(_t.optionsMoney);
                    }
                });
            },
            // 获取若干车站库存记录
            getStationInventoryRecord() {
                var _t = this;
                _t.$nextTick(function () {
                    var myECharts;
                    if (_t.isMLC === true) {
                        myECharts = _t.$echarts.init(document.getElementById('inventoryMLC'));
                    } else if (_t.isMLC === false) {
                        myECharts = _t.$echarts.init(document.getElementById('inventorySC'));
                    } else {
                        myECharts = '';
                    }
                    if (myECharts !== '') {
                        myECharts.setOption(_t.optionsInventory);
                    }
                });
            },
            // 获取长短款单据
            getShortData(location_number, operator_id) {
                var _t = this;
                let str = "userid=" + operator_id
                    + "&location_number=" + location_number;
                let Base64 = require("js-base64").Base64;
                let keyToken = _t.$md5(Base64.encode(str));
                let postData = {
                    userid: operator_id, // 操作员id
                    location_number: location_number, // 位置编码
                    difference_state: '01', // 短款
                    issue: '0', // 待补缴
                    create_dt_begin: dateFilterThisDay(new Date().getTime()), // 开始时间
                    create_dt_end: null, // 结束时间
                    pageNum: 1, // 当前页
                    pageSize: 5, //每页显示条数
                    token: keyToken // token
                };
                _t.$api.post("/tsGateWay/incomeMoney/searchMoneyDifferenceOrderGateWay", postData, function (res) {
                    if (res.rtCode && res.rtCode === "11010") {
                        _t.shortData = res.rtData === null ? [] : res.rtData;
                    } else if (res.rtCode) {
                        _t.shortData = [];
                    }
                });
            },
            // 获取车票调配单据
            getTicketWithData(location_number, operator_id) {
                var _t = this;
                let str = "location_number=" + location_number + "&operator_id=" + operator_id;
                let Base64 = require("js-base64").Base64;
                let keyToken = _t.$md5(Base64.encode(str));
                let postData = {
                    location_number: location_number, // 位置编码
                    operator_id: operator_id, // 操作员id
                    order_state: null, // 状态
                    start_time: dateFilterThisDay(new Date().getTime()), // 开始时间
                    end_time: null, // 结束时间
                    order_id: null, //单据编号
                    pageNum: 1, // 当前页
                    pageSize: 5, // 每页显示条数
                    token: keyToken, // token
                };
                _t.$api.post("/tsGateWay/ticketTransfer/transferOrderQueryGateWay", postData, function (res) {
                    if (res.rtCode && res.rtCode === "10009") {
                        _t.ticketData = res.rtData === null ? [] : res.rtData;
                    } else {
                        _t.ticketData = [];
                    }
                });
            },
            // 获取若干备用金调配单据
            getMoneyWithData(location_number, operator_id) {
                var _t = this;
                let str = 'location_number=' + location_number + '&operator_id=' + operator_id;
                let Base64 = require('js-base64').Base64;
                let keyToken = _t.$md5(Base64.encode(str));
                var params = {
                    location_number: location_number, // 位置编码
                    operator_id: operator_id, // 操作员id
                    token: keyToken, // token
                    order_id: null, // 单号
                    order_state: null,
                    start_time: dateFilterThisDay(new Date().getTime()), // 开始时间
                    end_time: null, // 结束时间
                    order_type: null, // 01: 配发 02:回收 03:上交
                    pageNum: 1, // 当前页
                    pageSize: 5, // 每页显示条数
                };
                _t.$api.post('/tsGateWay/readyMoney/transferOrderQueryGateWay', params, function (res) {
                    if (res.rtCode && res.rtCode === '11104') {
                        // 请求成功
                        _t.moneyData = res.rtData === null ? [] : res.rtData;
                    } else if (res.rtCode) {
                        _t.moneyData = [];
                    }
                });
            }
        },
        created() {
            var _t = this;
            _t.$store.commit('setLoading', true);
            var limitMenuList = JSON.parse(localStorage.getItem('limitMenuList'));
            if (limitMenuList !== null && limitMenuList.length !== 0) {
                var limitBtnArr = new Array();
                limitMenuList.forEach((item) => {
                    var path = _t.$route.path;
                    // 找到了对应权限的页面
                    if (item.URL === path) {
                        // 获取按钮级别权限
                        if (item.CHILDREN !== null) {
                            limitBtnArr = item.CHILDREN
                        }
                        // 本页面业务逻辑
                        _t.getData(limitBtnArr);
                    }
                });
            }
        },
        mounted() {
            var _t = this;
            window.onresize = function () {
                var moneyRecordMLC = document.getElementById('moneyRecordMLC');
                var moneyRecordSC = document.getElementById('moneyRecordSC');
                var inventoryMLC = document.getElementById('inventoryMLC');
                var inventorySC = document.getElementById('inventorySC');
                if (moneyRecordMLC !== null) {
                    var moneyEChartsMLC = _t.$echarts.init(moneyRecordMLC);
                    moneyEChartsMLC.resize();
                }
                if (moneyRecordSC !== null) {
                    var moneyEChartsSC = _t.$echarts.init(moneyRecordSC);
                    moneyEChartsSC.resize();
                }
                if (inventoryMLC !== null) {
                    var inventoryEChartsMLC = _t.$echarts.init(inventoryMLC);
                    inventoryEChartsMLC.resize();
                }
                if (inventorySC !== null) {
                    var inventoryEChartsSC = _t.$echarts.init(inventorySC);
                    inventoryEChartsSC.resize();
                }
            };
        },
        destroyed() {
            // 组件离开时销毁
            window.onresize = null;
        }
    }
</script>

<style scoped>
  .title {
    font-size: 15px;
    font-weight: bold;
    height: 30px;
    line-height: 30px;
    margin-bottom: 15px;
  }

  .home_list li {
    float: left;
    width: 50%;
    min-height: 400px;
  }

  .home_list li:nth-child(odd) {
    border-right: 1px solid #ddd;
    padding-right: 20px;
  }

  .home_list li:nth-child(even) {
    padding-left: 20px;
  }

  .eCharts {
    width: 100%;
    height: 300px;
  }
</style>
