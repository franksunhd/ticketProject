<template>
  <Box>
    <div class="formBox-top">
      <el-form :model="formItem" label-width="110px" inline>
        <el-form-item label="线路：" class="marBottom7">
          <el-select
            class="width200"
            @change="changeLines(formItem.lines)"
            v-model="formItem.lines">
            <el-option
              v-for="(item,index) in linesList"
              :key="index"
              :label="item.LINE_LOCATION_NAME"
              :value="item.LINE_LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item label="车站：" class="marBottom7">
          <el-select
            class="width200"
            @change="changeStation(formItem.station)"
            v-model="formItem.station">
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item label="操作员ID：" class="marBottom7">
          <el-select
            class="width200"
            v-model="formItem.operationId">
            <el-option
              v-for="(item,index) in operatorIdList"
              :key="index"
              :label="item.USERNAME + '-' + item.USERID"
              :value="item.USERID.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item label="单据类型：" class="marBottom7">
          <el-select
            clearable
            class="width200"
            v-model="formItem.type">
            <el-option
              v-for="(item,index) in statusList"
              :key="index"
              :label="item.NAME"
              :value="item.VALUE"/>
          </el-select>
        </el-form-item>
        <el-form-item label="单据号：" class="marBottom7">
          <el-input class="width200" v-model="formItem.orderNum" placeholder="请输入单号"/>
        </el-form-item>
        <el-form-item label="创建时间：" class="marBottom7">
          <el-date-picker
            v-model="formItem.dateTime"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"/>
        </el-form-item>
        <br>
        <el-form-item class="fr marBottom7">
          <el-button type="primary" v-if="limitBtn.queryBtn" @click="getData">查询</el-button>
          <el-button type="warning" @click="resetFormItem">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="tableWp">
      <div class="marBottom10">
        <!-- 按钮部分 -->
        <el-button v-if="limitBtn.lading" :disabled="disabledBtn.lading" @click="ladingBtn" type="primary">装机
        </el-button>
        <el-button v-if="limitBtn.supplement" :disabled="disabledBtn.supplement" @click="supplementBtn" type="primary">
          补充
        </el-button>
        <el-button v-if="limitBtn.make " :disabled="disabledBtn.make" @click="makeBtn" type="primary">清点</el-button>
        <el-button v-if="limitBtn.recycle" :disabled="disabledBtn.recycle" @click="recycleBtn" type="primary">回收
        </el-button>
      </div>
      <!-- 表格内容 -->
      <el-table :data="tableData" border stripe @row-click="rowClick"
                :default-sort="{prop:'CREATE_TIME',order:'descending'}">
        <el-table-column label="请选择" width="70px" header-align="center" align="center">
          <template slot-scope="scope">
            <el-radio
              @change.native="changeTableBox(scope.row)"
              v-model="tableSelect.id"
              :label="scope.row.ROW_ID">&nbsp;
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="LINE_NAME" label="线路" header-align="center" align="center"/>
        <el-table-column prop="STATION_NAME" label="车站" header-align="center" align="center"/>
        <el-table-column prop="ORDER_ID" label="单据号" header-align="center" align="center"/>
        <el-table-column prop="OPERATE_TYPE_NAME" label="单据类型" header-align="center" align="center"/>
        <el-table-column prop="CREATE_TIME" sortable label="创建时间" header-align="center" align="center"/>
        <el-table-column label="操作员" header-align="center" align="center">
          <template slot-scope="scope">
            <span>{{scope.row.TVM_CREATOR_NAME}}</span>
            <span>-</span>
            <span>{{scope.row.TVM_CREATOR_ID}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="OPERATE_STATE_NAME" sortable label="单据状态" header-align="center" align="center"/>
        <el-table-column label="操作" header-align="center" align="center">
          <template slot-scope="scope">
            <el-button v-if="limitBtn.detail" @click.stop="detailsData(scope.row)" type="primary">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pages
        :total="options.total"
        :currentPage="options.currentPage"
        :page-size="options.pageSize"
        @handleSizeChangeSub="handleSizeChangeSub"
        @handleCurrentChangeSub="handleCurrentChange"/>
    </div>
    <!--TVM操作单详情-->
    <el-dialog
      append-to-body
      :fullscreen="isScreen"
      :before-close="resetDetail"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogDetailVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">TVM操作单详情</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-form :model="formDetail" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路：">
              <el-input v-model="formDetail.LINE_NAME" disabled/>
            </el-form-item>
            <el-form-item label="单据类型：">
              <el-input v-model="formDetail.OPERATE_TYPE_NAME" disabled/>
            </el-form-item>
            <el-form-item label="单据状态：">
              <el-input v-model="formDetail.OPERATE_STATE_NAME" disabled/>
            </el-form-item>
            <el-form-item label="操作金额(元)：">
              <el-input v-model="formDetail.MONEY" disabled/>
            </el-form-item>
            <el-form-item label="操作有效票(张)：">
              <el-input v-model="formDetail.TICKET_YOUXIAO" disabled/>
            </el-form-item>
            <el-form-item label="创建时间：">
              <el-input v-model="formDetail.CREATE_TIME" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车站：">
              <el-input v-model="formDetail.STATION_NAME" disabled/>
            </el-form-item>
            <el-form-item label="单据号：">
              <el-input v-model="formDetail.ORDER_ID" disabled/>
            </el-form-item>
            <el-form-item label="操作员：">
              <el-input v-model="formDetail.TVM_CREATOR" disabled/>
            </el-form-item>
            <el-form-item label="设备名称：">
              <el-input v-model="formDetail.DEVICE_NAME" disabled/>
            </el-form-item>
            <el-form-item label="操作无效票(张)：">
              <el-input v-model="formDetail.TICKET_WUXIAO" disabled/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="resetDetail">取消</el-button>
        <el-button type="primary" @click="resetDetail">确定</el-button>
      </div>
    </el-dialog>
  </Box>
</template>
<script>
    import Box from "../../../components/Box";
    import {dateFilter} from "../../../assets/js/filters";

    export default {
        name: "TVMOperation",
        components: {Box},
        data() {
            return {
                isScreen: false, // 详情放大缩小
                // 查询表单
                formItem: {
                    lines: '', // 线路
                    station: '', //车站
                    operationId: '', // 操作员id
                    type: '', // 单据类型
                    orderNum: '', // 单据编号
                    dateTime: [], // 创建时间
                },
                // 表格数据
                tableData: [],
                // 线路集合
                linesList: [],
                // 车站集合
                stationList: [],
                // 操作员id集合
                operatorIdList: [],
                // 分页
                options: {
                    total: 0, // 总条数
                    currentPage: 1, // 当前页码
                    pageSize: 10 // 显示条数
                },
                // 单据类型
                statusList: [],
                // 按钮权限
                limitBtn: {
                    queryBtn: false, // 查询
                    lading: false, // 装机
                    supplement: false, // 补充
                    make: false, // 清点
                    recycle: false, // 回收
                    detail: false // 详情
                },
                // 启动禁用按钮
                disabledBtn: {
                    lading: true, // 装机
                    supplement: true, // 补充
                    make: true, // 清点
                    recycle: true, // 回收
                },
                // TVM操作单详情表格
                tableDetail: [],
                // TVM操作单详情表单
                formDetail: {
                    LINE_NAME: '', // 线路
                    STATION_NAME: '', // 车站
                    OPERATE_TYPE_NAME: '', // 单据类型
                    ORDER_ID: '', // 单据号
                    CREATE_TIME: '', // 创建时间
                    TVM_CREATOR: '', // 操作员
                    OPERATE_STATE_NAME: '', // 单据状态
                    DEVICE_NAME: '', // 设备名称
                    MONEY: '', // 操作金额
                    TICKET_YOUXIAO: '', // 有效
                    TICKET_WUXIAO: '', // 无效
                },
                // 详情蒙版
                dialogDetailVisible: false,
                // 表格选中数据集合
                tableSelect: {
                    id: '', // id
                },
                // 从cookie中获取
                cookieMap: {
                    location_number: this.getCookie('LOCATION_NUMBER'), // 位置编号
                    user_id: this.getCookie('USER_ID'), // 操作员ID
                    role: this.getCookie('USER_TYPE'), // 用户角色
                }
            };
        },
        methods: {
            // 重置查询表单
            resetFormItem() {
                var _t = this;
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
                if (_t.cookieMap.role !== null
                    && _t.cookieMap.role !== 'null'
                    && _t.cookieMap.location_number !== null
                    && _t.cookieMap.location_number !== 'null') {
                    switch (row.OPERATE_STATE) {
                        case '01': // 未审核
                            if (_t.cookieMap.role === 'SC'
                                || (_t.cookieMap.role === 'MLC'
                                    && _t.cookieMap.location_number.substr(0, 1) === '1')) {
                                _t.disabledBtn.supplement = false; // 补充
                                _t.disabledBtn.make = false; // 清点
                                _t.disabledBtn.recycle = false; // 回收
                            } else {
                                _t.disabledBtn.supplement = true; // 补充
                                _t.disabledBtn.make = true; // 清点
                                _t.disabledBtn.recycle = true; // 回收
                            }
                            break;
                        default:
                            _t.disabledBtn.supplement = true; // 补充
                            _t.disabledBtn.make = true; // 清点
                            _t.disabledBtn.recycle = true; // 回收
                            break;
                    }
                }
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
                var location_number = '';
                var operator_id = '';
                var location_number_query = '';
                // 判断
                if (_t.cookieMap.location_number !== null
                    && _t.cookieMap.location_number !== 'null'
                    && _t.cookieMap.role !== null
                    && _t.cookieMap.role !== 'null') {
                    // SC角色或者MLC 1
                    if (_t.cookieMap.role === 'SC'
                        || (_t.cookieMap.role === 'MLC' && _t.cookieMap.location_number.substr(0, 1)) === '1') {
                        location_number = _t.cookieMap.location_number;
                        location_number_query = '';
                        operator_id = _t.formItem.operationId === '' ? _t.cookieMap.user_id : _t.formItem.operationId;
                    } else if (_t.cookieMap.role === 'MLC' && _t.cookieMap.location_number.substr(0, 1) === '3') {
                        location_number = _t.formItem.lines === '' ? _t.cookieMap.location_number : _t.formItem.lines;
                        location_number_query = _t.formItem.station;
                        operator_id = _t.formItem.operationId === '' ? _t.cookieMap.user_id : _t.formItem.operationId
                    }
                }
                let postData = {
                    location_number: location_number, // 线路
                    location_number_query: location_number_query === '' ? null : location_number_query, // 车站
                    order_id: _t.formItem.orderNum.trim() === '' ? null : _t.formItem.orderNum.trim(), // 单据号
                    tvm_creator_id: operator_id, // 操作员id
                    operate_type: _t.formItem.type === '' ? null : _t.formItem.type, // 单据类型
                    operate_state: null, // 单据状态
                    start_dt: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[0] !== undefined ? dateFilter(_t.formItem.dateTime[0].getTime()) : null) : null, // 开始时间
                    end_dt: _t.formItem.dateTime !== null ? (_t.formItem.dateTime[1] !== undefined ? dateFilter(_t.formItem.dateTime[1].getTime()) : null) : null, // 结束时间
                    pageNum: _t.options.currentPage, // 当前页
                    pageSize: _t.options.pageSize //每页显示条数
                };
                _t.$api.post("/tsGateWay/tvmManager/getOperationOrder", postData, function (res) {
                    _t.$store.commit("setLoading", false);
                    if (res.rtCode && res.rtCode === "13006") {
                        _t.tableData = res.rtData === null ? [] : res.rtData;
                        _t.options.total = res.totalCount ? res.totalCount : 0;
                    } else if (res.rtCode) {
                        _t.alertDialogTip(_t, '查询失败!');
                    }
                });
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
                            _t.alertDialogTip(_t, '查询失败!');
                        }
                    }
                );
            },
            // 处理线路/车站/操作员之间首次加载数据问题
            dealWithLinesAndStation(linesStationArr) {
                var _t = this;
                // 判断角色
                // 角色和location都不为空
                if (_t.cookieMap.role !== null
                    && _t.cookieMap.role !== "null"
                    && _t.cookieMap.location_number !== null
                    && _t.cookieMap.location_number !== "null") {
                    // 车站角色
                    var linesArr = new Array(); // 线路集合
                    var stationArr = new Array(); // 车站集合
                    var operationArr = new Array(); // 操作员id集合
                    var LINE_LOCATION_NUMBER = ""; // 选中的线路
                    var LOCATION_NUMBER = ""; // 选中的车站
                    var USERID = ""; // 选中的操作员
                    if (_t.cookieMap.role === "SC") {
                        // SC登录的具体车站
                        linesStationArr.forEach(item => {
                            // 存在车站集合
                            if (item.stationList !== undefined && item.stationList !== null) {
                                // 遍历车站
                                item.stationList.forEach(val => {
                                    // 找到了对应的车站
                                    if (val.LOCATION_NUMBER.toString() === _t.cookieMap.location_number) {
                                        // 线路下拉框
                                        linesArr[0] = item;
                                        // 线路选中值
                                        LINE_LOCATION_NUMBER = item.LINE_LOCATION_NUMBER.toString();
                                        // 车站下拉框
                                        stationArr[0] = val;
                                        // 车站选中值
                                        LOCATION_NUMBER = _t.cookieMap.location_number;
                                        // 存在操作员集合
                                        if (val.userList !== undefined && val.userList !== null) {
                                            // 操作员集合赋值 允许多个操作员
                                            operationArr = val.userList;
                                            // 遍历操作员集合
                                            operationArr.forEach(data => {
                                                // 匹配到自身 并赋值
                                                if (data.USERID === _t.cookieMap.user_id) {
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
                    } else if (_t.cookieMap.role === "MLC" && _t.cookieMap.location_number.substr(0, 1) === "1") {
                        // MLC登录的具体车站
                        linesStationArr.forEach(item => {
                            // 线路存在车站
                            if (item.stationList !== undefined && item.stationList !== null) {
                                // 遍历车站
                                item.stationList.forEach(val => {
                                    // 找到了对应的车站
                                    if (val.LOCATION_NUMBER.toString() === _t.cookieMap.location_number) {
                                        // 线路下拉框
                                        linesArr = linesStationArr;
                                        // 线路选中值
                                        LINE_LOCATION_NUMBER = item.LINE_LOCATION_NUMBER.toString();
                                        // 车站下拉框
                                        stationArr = item.stationList;
                                        // 车站选中值
                                        LOCATION_NUMBER = _t.cookieMap.location_number;
                                        if (val.userList !== undefined && val.userList !== null) {
                                            operationArr = val.userList;
                                            operationArr.forEach(data => {
                                                if (data.USERID === _t.cookieMap.user_id) {
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
                    } else if (_t.cookieMap.role === "MLC" && _t.cookieMap.location_number.substr(0, 1) === "3") {
                        // MLC登录线路中心
                        linesArr = linesStationArr;
                        // 遍历线路下拉框
                        linesArr.forEach(item => {
                            // 匹配到 线路
                            if (item.LINE_LOCATION_NUMBER.toString() === _t.cookieMap.location_number) {
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
                            if (item.stationList !== undefined && item.stationList !== null) {
                                // 车站下拉框赋值
                                _t.stationList = item.stationList;
                            } else {
                                // 车站下拉框置空
                                _t.stationList = [];
                            }
                            // 选中车站置空
                            _t.formItem.station = "";
                            // 操作员下拉框置空
                            _t.operatorIdList = [];
                            // 操作员id置空
                            _t.formItem.operationId = "";
                        }
                    });
                } else {
                    // 选中线路为空
                    _t.stationList = [];
                    _t.formItem.station = "";
                    _t.operatorIdList = [];
                    _t.formItem.operationId = "";
                }
            },
            // 改变车站
            changeStation(val) {
                var _t = this;
                if (val !== "") {
                    // 遍历车站集合
                    _t.stationList.forEach(item => {
                        // 找到车站
                        if (item.LOCATION_NUMBER.toString() === val) {
                            // 存在操作员集合
                            if (item.userList !== undefined && item.userList !== null) {
                                // 操作员集合赋值
                                _t.operatorIdList = item.userList;
                                // 遍历操作员集合
                                _t.operatorIdList.forEach(data => {
                                    // 找到自身
                                    if (data.USERID === _t.cookieMap.user_id) {
                                        _t.formItem.operationId = data.USERID;
                                    } else {
                                        // 置为空
                                        _t.formItem.operationId = "";
                                    }
                                });
                            } else {
                                // 对应车站没有操作员集合
                                _t.operatorIdList = [];
                                _t.formItem.operationId = "";
                            }
                        }
                    });
                } else {
                    // 车站改变值为空
                    _t.operatorIdList = [];
                    _t.formItem.operationId = "";
                }
            },
            // 装机
            ladingBtn() {
                var _t = this;
                _t.$router.push({name: 'TVMOperationAdd'});
            },
            // 补充
            supplementBtn() {
                var _t = this;
                _t.$router.push({name: 'TVMOperationEdit'});
            },
            // 清点
            makeBtn() {
                var _t = this;
                _t.$router.push({name: 'TVMOperationAdvance'});
            },
            // 回收
            recycleBtn() {
                var _t = this;
                _t.$router.push({name: 'TVMOperationRecycle'});
            },
            // TVM操作单管理详情
            detailsData(row) {
                var _t = this;
                _t.dialogDetailVisible = true;
                _t.getDetailData(row.ORDER_ID);
            },
            // 获取详情数据
            getDetailData(ORDER_ID) {
                var _t = this;
                let str = "order_id=" + ORDER_ID;
                let Base64 = require("js-base64").Base64;
                let keyToken = _t.$md5(Base64.encode(str));
                var params = {
                    order_id: ORDER_ID,
                    pageNum: 1,
                    pageSize: 10,
                    token: keyToken
                };
                _t.$api.post('/tsGateWay/tvmManager/getOperationOrderDetail', params, function (res) {
                    if (res.rtCode && res.rtCode === '13007') {
                        if (res.rtData !== null && res.rtData.length !== 0) {
                            _t.formDetail.LINE_NAME = res.rtData[0].LINE_NAME ? res.rtData[0].LINE_NAME : ''; // 线路
                            _t.formDetail.STATION_NAME = res.rtData[0].STATION_NAME ? res.rtData[0].STATION_NAME : ''; // 车站
                            _t.formDetail.OPERATE_TYPE_NAME = res.rtData[0].OPERATE_TYPE_NAME ? res.rtData[0].OPERATE_TYPE_NAME : ''; // 单据类型
                            _t.formDetail.ORDER_ID = res.rtData[0].ORDER_ID ? res.rtData[0].ORDER_ID : ''; // 单据号
                            _t.formDetail.CREATE_TIME = res.rtData[0].CREATE_TIME ? res.rtData[0].CREATE_TIME : ''; // 创建时间
                            _t.formDetail.TVM_CREATOR = (res.rtData[0].TVM_CREATOR_NAME ? res.rtData[0].TVM_CREATOR_NAME : '') + '-' + (res.rtData[0].TVM_CREATOR_ID ? res.rtData[0].TVM_CREATOR_ID : ''); // 操作员
                            _t.formDetail.OPERATE_STATE_NAME = res.rtData[0].OPERATE_STATE_NAME ? res.rtData[0].OPERATE_STATE_NAME : ''; // 单据状态
                            _t.formDetail.DEVICE_NAME = res.rtData[0].DEVICE_NAME ? res.rtData[0].DEVICE_NAME : ''; // 设备名称
                            _t.formDetail.MONEY = res.rtData[0].MONEY ? res.rtData[0].MONEY : ''; // 操作金额
                            _t.formDetail.TICKET_YOUXIAO = res.rtData[0].TICKET_YOUXIAO ? res.rtData[0].TICKET_YOUXIAO : ''; // 有效
                            _t.formDetail.TICKET_WUXIAO = res.rtData[0].TICKET_WUXIAO ? res.rtData[0].TICKET_WUXIAO : ''; // 无效
                        }
                    } else if (res.rtCode) {
                        _t.alertDialogTip(_t, '查询失败!');
                    }
                });
            },
            // 重置详情表单
            resetDetail() {
                var _t = this;
                _t.dialogDetailVisible = false;
                _t.formDetail.LINE_NAME = ''; // 线路
                _t.formDetail.STATION_NAME = ''; // 车站
                _t.formDetail.OPERATE_TYPE_NAME = ''; // 单据类型
                _t.formDetail.ORDER_ID = ''; // 单据号
                _t.formDetail.CREATE_TIME = ''; // 创建时间
                _t.formDetail.TVM_CREATOR = ''; // 操作员
                _t.formDetail.OPERATE_STATE_NAME = ''; // 单据状态
                _t.formDetail.DEVICE_NAME = ''; // 设备名称
                _t.formDetail.MONEY = ''; // 操作金额
                _t.formDetail.TICKET_YOUXIAO = ''; // 有效
                _t.formDetail.TICKET_WUXIAO = ''; // 无效
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
                    if (item.MENU_ID === "GUID00000000000000000000000000000111") {
                        _t.limitBtn.queryBtn = true;
                    }
                    // 装机
                    if (item.MENU_ID === "GUID00000000000000000000000000000112") {
                        _t.limitBtn.lading = true;
                        // 启用装机
                        if (_t.cookieMap.role !== null
                            && _t.cookieMap.role !== 'null'
                            && _t.cookieMap.location_number !== null
                            && _t.cookieMap.location_number !== 'null') {
                            // SC 或者 MLC 1开头 取消禁用
                            if (_t.cookieMap.role === 'SC'
                                || (_t.cookieMap.role === 'MLC'
                                    && _t.cookieMap.location_number.substr(0, 1) === '1')) {
                                _t.disabledBtn.lading = false;
                            } else {
                                _t.disabledBtn.lading = true;
                            }
                        }
                    }
                    // 补充
                    if (item.MENU_ID === "GUID00000000000000000000000000000113") {
                        _t.limitBtn.supplement = true;
                    }
                    // 清点
                    if (item.MENU_ID === "GUID00000000000000000000000000000114") {
                        _t.limitBtn.make = true;
                    }
                    // 回收
                    if (item.MENU_ID === "GUID00000000000000000000000000000115") {
                        _t.limitBtn.recycle = true;
                    }
                    // 详情
                    if (item.MENU_ID === "GUID00000000000000000000000000000117") {
                        _t.limitBtn.detail = true;
                    }
                });
            }
        }
    };
</script>

<style scoped>

</style>
