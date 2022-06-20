<template>
  <Box>
    <div class="formBox-top">
      <el-form inline :model="formItem" ref="form" label-width="110px">
        <el-form-item label="线路：" class="marBottom7">
          <el-select
            class="width200"
            @change="changeLines(formItem.lines)"
            placeholder="请选择线路"
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
            placeholder="请选择车站"
            v-model="formItem.station">
            <el-option
              v-for="(item,index) in stationList"
              :key="index"
              :label="item.STATION_LOCATION_NAME"
              :value="item.LOCATION_NUMBER.toString()"/>
          </el-select>
        </el-form-item>
        <el-form-item label="车票类型：" class="marBottom7">
          <el-select
            clearable
            class="width200"
            v-model="formItem.ticketType"
            placeholder="请选择车票类型">
            <el-option
              v-for="(item,index) in ticketType"
              :key="index"
              :label="item.STOCK_TYPE_NAME_CN"
              :value="item.STOCK_MANAGE_TYPE_ID"/>
          </el-select>
        </el-form-item>
        <el-form-item label="库存状态：" class="marBottom7">
          <el-select
            clearable
            class="width200"
            v-model="formItem.status"
            placeholder="请选择库存状态">
            <el-option
              v-for="item in statusList"
              :key="item.VALUE"
              :label="item.NAME"
              :value="item.VALUE"/>
          </el-select>
        </el-form-item>
        <br>
        <el-form-item class="marBottom7 fr">
          <el-button v-if="limitBtn.queryBtn" type="primary" @click="getData">查询</el-button>
          <el-button type="warning" @click="resetFormItem">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="tableWp">
      <el-table :data="tableData" border stripe :default-sort="{prop:'STOCK_STATE',order:'descending'}">
        <el-table-column prop="LOCATION_TYPE_NAME" label="线路" header-align="center" align="center"/>
        <el-table-column prop="STATION_NAME" label="车站" header-align="center" align="center"/>
        <el-table-column prop="STOCK_TYPE_NAME_CN" label="车票类型" header-align="center" align="center"/>
        <el-table-column prop="STOCK_STATE_NAME" label="库存状态" sortable header-align="center" align="center"/>
        <el-table-column prop="TICKET_NUMBER" label="库存数量(张)" header-align="center" align="center"/>
        <el-table-column fixed="right" width="150px" header-align="center" align="center" label="操作">
          <template slot-scope="scope">
            <el-button v-if="limitBtn.operation" @click="handleClick(scope.row)" type="primary">库存操作</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <pages
        :total='options.total'
        :currentPage='options.currentPage'
        :page-size="options.pageSize"
        @handleSizeChangeSub="handleSizeChangeSub"
        @handleCurrentChangeSub="handleCurrentChange"/>
    </div>
    <!--库存操作-->
    <el-dialog
      append-to-body
      :fullscreen="isScreen"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="resetStock"
      :visible.sync="dialogFormVisible">
      <div slot="title" class="dialogTitle clearFix">
        <span class="title">库存操作</span>
        <i class="el-icon-copy-document" title="放大/缩小" @click="isScreen = !isScreen"></i>
      </div>
      <el-form ref="addEdit" :model="addEdit" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路：">
              <el-select
                disabled
                class="widthAll"
                placeholder="请选择线路"
                v-model="addEdit.lines">
                <el-option
                  v-for="(item,index) in linesList"
                  :key="index"
                  :label="item.LINE_LOCATION_NAME"
                  :value="item.LINE_LOCATION_NUMBER.toString()"/>
              </el-select>
            </el-form-item>
            <el-form-item label="库存数量(张)：">
              <el-input
                v-model="addEdit.stock_quantity"
                disabled/>
            </el-form-item>
            <el-form-item class="star" label="操作类型：">
              <el-select
                class="widthAll"
                v-model="addEdit.operation_type"
                @change="changeType(addEdit.operation_type)"
                placeholder="请选择操作类型">
                <el-option
                  v-for="(item,index) in typeList"
                  :key="index"
                  :label="item.TYPE_NAME"
                  :value="item.TYPE_VALUE"/>
              </el-select>
              <span v-if="errorTip.typeFlag" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="认证操作人员：">
              <el-input
                maxlength="12"
                v-model="addEdit.identified_operator_id"
                @blur="blurInputUser(errorTip,addEdit.identified_operator_id,'userFlag')"
                placeholder="请输入认证操作人员"/>
              <span v-if="errorTip.userFlag" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="操作数量(张)：">
              <el-input
                maxlength="6"
                oninput="value=value.replace(/[^\d]/g,'')"
                v-model="addEdit.quantity"
                @blur="blurInputNum"
                placeholder="请输入操作数量"/>
              <span v-if="errorTip.operationFlag" class="isNotNull">{{errorTip.operationTip}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车站：">
              <el-select
                disabled
                class="widthAll"
                placeholder="请选择车站"
                v-model="addEdit.station">
                <el-option
                  v-for="(item,index) in dialogStationList"
                  :key="index"
                  :label="item.STATION_LOCATION_NAME"
                  :value="item.LOCATION_NUMBER.toString()"/>
              </el-select>
            </el-form-item>
            <el-form-item label="车票类型：">
              <el-input disabled v-model="addEdit.stock_manage_type_name"/>
            </el-form-item>
            <el-form-item class="star" label="变更原因：">
              <el-select
                class="widthAll"
                v-model="addEdit.change_reason"
                @change="changeReason(addEdit.change_reason)"
                placeholder="请选择变更原因">
                <el-option
                  v-for="(item,index) in reasonList"
                  :key="index"
                  :label="item.REASON_NAME"
                  :value="item.REASON_VALUE"/>
              </el-select>
              <span v-if="errorTip.reasonFlag" class="isNotNull">必填项不能为空</span>
            </el-form-item>
            <el-form-item class="star" label="密码：">
              <el-input
                maxlength="12"
                v-model="addEdit.identified_operator_password"
                type="password"
                @blur="blurInputUser(errorTip,addEdit.identified_operator_password,'passwordFlag')"
                placeholder="请输入密码"/>
              <span v-if="errorTip.passwordFlag" class="isNotNull">必填项不能为空</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注：">
          <el-input type="textarea" v-model="addEdit.note" maxlength="250" show-word-limit/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="resetStock">取消</el-button>
        <el-button type="primary" @click="addEditData">确定</el-button>
      </div>
    </el-dialog>
  </Box>
</template>

<script>
    import Box from '../../../components/Box';

    export default {
        name: "ticketStockChange",
        components: {Box},
        data() {
            return {
                isScreen: false,
                // 查询表单
                formItem: {
                    lines: '', // 线路
                    station: '', // 车站
                    ticketType: '', // 车票类型
                    status: '', // 库存状态
                },
                // 分页
                options: {
                    total: 0, // 总条数
                    currentPage: 1, // 当前页码
                    pageSize: 10, // 显示条数
                },
                // 控制按钮权限显示隐藏
                limitBtn: {
                    queryBtn: false,
                    operation: false
                },
                // 库存操作蒙版
                dialogFormVisible: false,
                // 库存状态集合
                statusList: [],
                // 线路集合
                linesList: [],
                // 车站集合
                stationList: [],
                // 表格数据
                tableData: [],
                // 车票类型集合
                ticketType: [],
                // 操作类型集合
                typeList: [],
                // 变更原因集合
                reasonList: [],
                // 弹出层车站集合
                dialogStationList: [],
                // 库存操作
                addEdit: {
                    lines: '', // 线路
                    station: '', // 车站
                    operation_type: '', // 操作类型
                    change_reason: '', // 变更原因
                    stock_manage_type_id: '', // 车票类型id
                    stock_manage_type_name: '', // 车票类型名称
                    stock_quantity: '', // 库存数量
                    quantity: '', // 操作数量
                    identified_operator_id: '', // 认证操作员
                    identified_operator_password: '', // 密码
                    note: '', // 备注
                },
                // 校验标识
                errorTip: {
                    typeFlag: false, // 操作类型
                    reasonFlag: false, // 变更原因
                    operationFlag: false, // 操作数量
                    operationTip: '', // 操作数量提示
                    userFlag: false, // 认证操作员
                    passwordFlag: false, // 密码
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
            // 查询数据
            getData() {
                var _t = this;
                var location_number = ''; // 发送请求的 位置编号
                var location_number_query = ''; // 发送请求的 query
                if (_t.cookieMap.role !== null && _t.cookieMap.role !== 'null'
                    && _t.cookieMap.user_id !== null && _t.cookieMap.user_id !== 'null'
                    && _t.cookieMap.location_number !== null && _t.cookieMap.location_number !== 'null') {
                    if (_t.cookieMap.role === 'SC' || (_t.cookieMap.role === 'MLC' && _t.cookieMap.location_number.substr(0, 1) === '1')) {
                        // 车站为空
                        if (_t.formItem.station === '') {
                            location_number = _t.cookieMap.location_number;
                        } else {
                            // 车站有值
                            location_number = _t.formItem.station;
                        }
                    } else if (_t.cookieMap.role === 'MLC' && _t.cookieMap.location_number.substr(0, 1) === '3') {
                        // 线路为空
                        if (_t.formItem.lines === '') {
                            location_number = _t.cookieMap.location_number;
                        } else {
                            // 线路不为空 判断车站是否为空
                            if (_t.formItem.station === '') {
                                // 车站为空
                                location_number = _t.formItem.lines;
                            } else {
                                // 车站不为空
                                location_number = _t.formItem.lines;
                                location_number_query = _t.formItem.station;
                            }
                        }
                    }
                }
                if (location_number !== '' && _t.cookieMap.user_id !== null && _t.cookieMap.user_id !== 'null') {
                    let str = 'location_number=' + location_number + '&operator_id=' + _t.cookieMap.user_id;
                    let Base64 = require('js-base64').Base64;
                    let keyToken = _t.$md5(Base64.encode(str));
                    let postData = {
                        location_number: location_number, // 位置编码
                        location_number_query: location_number_query === '' ? null : location_number_query, // 位置编码
                        operator_id: _t.cookieMap.user_id, // 操作员id
                        stock_manage_type_id: _t.formItem.ticketType === '' ? null : _t.formItem.ticketType, // 车票类型
                        stock_state: _t.formItem.status === '' ? null : _t.formItem.status, // 库存状态
                        pageNum: _t.options.currentPage, // 当前页
                        pageSize: _t.options.pageSize, // 每页显示条数
                        token: keyToken, // token
                    };
                    // 车票库存查询
                    _t.$api.post('/tsGateWay/ticketStockManage/ticketStockQueryGateWay', postData, function (res) {
                        _t.$store.commit('setLoading', false);
                        // 数据调取成功
                        if (res.rtCode && res.rtCode === '10001') {
                            _t.tableData = res.rtData === null ? [] : res.rtData;
                            _t.options.total = res.totalCount ? res.totalCount : 0;
                        } else if (res.rtCode) {
                            _t.alertDialogTip(_t, '查询失败!');
                        }
                    });
                }
            },
            // 查询线路及车站
            getLinesAndStation() {
                var _t = this;
                _t.$api.post('/tsGateWay/ticketUtility/locationCascadeQuery', {}, function (res) {
                    // 查到线路信息
                    if (res.rtCode && res.rtCode === '14007') {
                        var linesStationArr = res.rtData === null ? [] : res.rtData;
                        // 处理线路/车站/操作员数据
                        _t.dealWithLinesAndStation(linesStationArr);
                    } else if (res.rtCode) {
                        _t.alertDialogTip(_t, '查询失败!');
                    }
                });
            },
            // 处理线路及车站首次加载数据问题
            dealWithLinesAndStation(linesStationArr) {
                var _t = this;
                // 角色和location都不为空
                if (_t.cookieMap.role !== null
                    && _t.cookieMap.role !== 'null'
                    && _t.cookieMap.location_number !== null
                    && _t.cookieMap.location_number !== 'null') {
                    // 车站角色
                    var linesArr = new Array(); // 线路集合
                    var stationArr = new Array(); // 车站集合
                    var LINE_LOCATION_NUMBER = ''; // 选中的线路
                    var LOCATION_NUMBER = ''; // 选中的车站
                    if (_t.cookieMap.role === 'SC') {
                        // SC登录的具体车站
                        linesStationArr.forEach((item) => {
                            // 存在车站集合
                            if (item.stationList !== undefined && item.stationList !== null) {
                                // 遍历车站
                                item.stationList.forEach((val) => {
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
                                    }
                                });
                            }
                        });
                        _t.linesList = linesArr;
                        _t.stationList = stationArr;
                        // 选中的线路
                        if (LINE_LOCATION_NUMBER !== '') {
                            _t.formItem.lines = LINE_LOCATION_NUMBER;
                        }
                        // 选中的车站
                        if (LOCATION_NUMBER !== '') {
                            _t.formItem.station = LOCATION_NUMBER;
                        }
                    } else if (_t.cookieMap.role === 'MLC'
                        && _t.cookieMap.location_number.substr(0, 1) === '1') {
                        // MLC登录的具体车站
                        linesStationArr.forEach((item) => {
                            // 线路存在车站
                            if (item.stationList !== undefined && item.stationList !== null) {
                                // 遍历车站
                                item.stationList.forEach((val) => {
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
                                    }
                                });
                            }
                        });
                        _t.linesList = linesArr;
                        _t.stationList = stationArr;
                        // 选中的线路
                        if (LINE_LOCATION_NUMBER !== '') {
                            _t.formItem.lines = LINE_LOCATION_NUMBER;
                        }
                        // 选中的车站
                        if (LOCATION_NUMBER !== '') {
                            _t.formItem.station = LOCATION_NUMBER;
                        }
                    } else if (_t.cookieMap.role === 'MLC' && _t.cookieMap.location_number.substr(0, 1) === '3') {
                        // MLC登录线路中心
                        linesArr = linesStationArr;
                        // 遍历线路下拉框
                        linesArr.forEach((item) => {
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
                if (val !== '') {
                    _t.linesList.forEach((item) => {
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
                            _t.formItem.station = '';
                        }
                    });
                } else {
                    // 选中线路为空
                    _t.stationList = [];
                    _t.formItem.station = '';
                }
            },
            // 认证员校验
            blurInputUser(item, val, flag) {
                item[flag] = val.trim() === '' ? true : false;
            },
            // 获取操作类型及操作原因级联接口
            getTypeAndReason() {
                var _t = this;
                var params = {
                    typeid: '01', // 01 车票 02 现金
                };
                _t.$api.post('/tsGateWay/ticketUtility/typeReasonCascadeQuery', params, function (res) {
                    // 查询成功
                    if (res.rtCode && res.rtCode === '14002') {
                        _t.typeList = res.rtData === null ? [] : res.rtData;
                    }
                });
            },
            // 改变操作类型
            changeType(val) {
                var _t = this;
                if (val !== '' && val !== null) {
                    // 隐藏校验提示
                    _t.errorTip.typeFlag = false;
                    _t.typeList.forEach((item) => {
                        if (item.TYPE_VALUE === val) {
                            // 变更原因赋值
                            _t.reasonList = item.reasonList === null ? [] : item.reasonList;
                        }
                    });
                } else {
                    // 显示提示
                    _t.errorTip.typeFlag = true;
                }
            },
            // 改变变更原因
            changeReason(val) {
                var _t = this;
                _t.errorTip.reasonFlag = val !== '' ? false : true;
            },
            // 失去焦点校验操作数量
            blurInputNum() {
                var _t = this;
                if (_t.addEdit.quantity.trim() === '') {
                    // 为空
                    _t.errorTip.operationFlag = true;
                    _t.errorTip.operationTip = '必填项不能为空';
                } else {
                    // 不为空 校验是否为数字
                    var reg = _t.$config.isNumber();
                    if (reg.test(_t.addEdit.quantity.trim()) === false) {
                        _t.errorTip.operationFlag = true;
                        _t.errorTip.operationTip = '格式不正确';
                    } else {
                        _t.errorTip.operationFlag = false;
                        _t.errorTip.operationTip = '';
                    }
                }
            },
            // 点击库存操作按钮
            handleClick(row) {
                var _t = this;
                if (row.LOCATION_NUMBER !== undefined) {
                    _t.linesList.forEach((item) => {
                        if (item.stationList !== null) {
                            item.stationList.forEach((val) => {
                                if (val.LOCATION_NUMBER.toString() === row.LOCATION_NUMBER.toString()) {
                                    // 线路
                                    _t.addEdit.lines = item.LINE_LOCATION_NUMBER.toString();
                                    // 车站
                                    _t.addEdit.station = row.LOCATION_NUMBER.toString();
                                    // 车站下拉框集合
                                    _t.dialogStationList = item.stationList;
                                    // 车票类型id
                                    _t.addEdit.stock_manage_type_id = row.STOCK_MANAGE_TYPE_ID ? row.STOCK_MANAGE_TYPE_ID : '';
                                    // 车票类型name
                                    _t.addEdit.stock_manage_type_name = row.STOCK_TYPE_NAME_CN ? row.STOCK_TYPE_NAME_CN : '';
                                    // 库存数量
                                    _t.addEdit.stock_quantity = row.TICKET_NUMBER !== undefined ? row.TICKET_NUMBER : '';
                                    // 显示蒙版
                                    _t.dialogFormVisible = true;
                                    // 操作类型及原因
                                    _t.getTypeAndReason();
                                }
                            });
                        }
                    });
                }
            },
            // 重置库存操作表单
            resetStock() {
                var _t = this;
                _t.dialogFormVisible = false;
                _t.addEdit.lines = ''; // 线路
                _t.addEdit.station = ''; // 车站
                _t.addEdit.operation_type = ''; // 操作类型
                _t.addEdit.change_reason = ''; // 变更原因
                _t.addEdit.stock_manage_type_id = ''; // 车票类型id
                _t.addEdit.stock_manage_type_name = ''; // 车票类型name
                _t.addEdit.stock_quantity = ''; // 库存数量
                _t.addEdit.quantity = ''; // 操作数量
                _t.addEdit.identified_operator_id = ''; // 认证操作员
                _t.addEdit.identified_operator_password = ''; // 密码
                _t.addEdit.note = ''; // 备注
                _t.errorTip.typeFlag = false; // 操作类型
                _t.errorTip.reasonFlag = false; // 变更原因
                _t.errorTip.operationFlag = false; // 操作数量
                _t.errorTip.operationTip = ''; // 操作数量提示
                _t.errorTip.userFlag = false; // 认证操作员
                _t.errorTip.passwordFlag = false; // 密码
            },
            // 库存操作提交
            addEditData() {
                var _t = this;
                // 校验操作类型
                _t.blurInputUser(_t.errorTip, _t.addEdit.operation_type, 'typeFlag');
                // 校验变更原因
                _t.blurInputUser(_t.errorTip, _t.addEdit.change_reason, 'reasonFlag');
                // 校验操作数量
                _t.blurInputNum();
                // 校验认证操作员
                _t.blurInputUser(_t.errorTip, _t.addEdit.identified_operator_id, 'userFlag');
                // 校验密码
                _t.blurInputUser(_t.errorTip, _t.addEdit.identified_operator_password, 'passwordFlag');
                if (_t.errorTip.typeFlag === false
                    && _t.errorTip.reasonFlag === false
                    && _t.errorTip.operationFlag === false
                    && _t.errorTip.userFlag === false
                    && _t.errorTip.passwordFlag === false
                    && _t.addEdit.station !== '') {
                    let str = 'location_number=' + _t.addEdit.station
                        + '&operator_id=' + _t.cookieMap.user_id
                        + '&operation_type=' + _t.addEdit.operation_type
                        + '&change_reason=' + _t.addEdit.change_reason
                        + '&stock_manage_type_id=' + _t.addEdit.stock_manage_type_id
                        + '&quantity=' + Number(_t.addEdit.quantity.trim())
                        + '&identified_operator_id=' + _t.addEdit.identified_operator_id.trim()
                        + '&identified_operator_password=' + _t.addEdit.identified_operator_password.trim();
                    let Base64 = require('js-base64').Base64;
                    let keyToken = _t.$md5(Base64.encode(str));
                    var params = {
                        location_number: _t.addEdit.station, // 位置编号
                        operator_id: _t.cookieMap.user_id, // 操作员id
                        token: keyToken, // token
                        operation_type: _t.addEdit.operation_type, // 操作类型
                        change_reason: _t.addEdit.change_reason, // 操作原因
                        stock_manage_type_id: _t.addEdit.stock_manage_type_id, // 车票类型
                        quantity: Number(_t.addEdit.quantity.trim()), // 操作金额
                        identified_operator_id: _t.addEdit.identified_operator_id.trim(), // 认证操作员id
                        identified_operator_password: _t.addEdit.identified_operator_password.trim(), // 密码
                        comment_info: _t.addEdit.note.trim(), // 备注
                    };
                    _t.$api.post('/tsGateWay/ticketStockManage/stockChangeSaveGateWay', params, function (res) {
                        // 操作成功
                        if (res.rtCode && res.rtCode === '10002') {
                            _t.$alert(res.rtMessage, '温馨提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消'
                            }).then(() => {
                                _t.getData();
                                _t.resetStock();
                            }).catch(() => {
                                _t.getData();
                                _t.resetStock();
                            });
                        } else if (res.rtCode === '20016') {
                            // 出库金额大于库存金额
                            _t.alertDialogTip(_t, res.rtMessage);
                        } else if (res.rtCode) {
                            _t.alertDialogTip(_t, '操作失败!');
                        }
                    });
                }
            },
            // 获取车票类型
            getTicketType() {
                var _t = this;
                if (_t.cookieMap.location_number !== null
                    && _t.cookieMap.location_number !== 'null'
                    && _t.cookieMap.user_id !== null
                    && _t.cookieMap.user_id !== 'null') {
                    let str = 'location_number=' + _t.cookieMap.location_number + '&operator_id=' + _t.cookieMap.user_id;
                    let Base64 = require('js-base64').Base64;
                    let keyToken = _t.$md5(Base64.encode(str));
                    var params = {
                        location_number: _t.cookieMap.location_number,
                        operator_id: _t.cookieMap.user_id,
                        token: keyToken,
                        pageNum: 1,
                        pageSize: 100
                    };
                    _t.$api.post('/tsGateWay/inventoryListService/ticketTypeQueryGateWay', params, function (res) {
                        if (res.rtCode && res.rtCode === '10005') {
                            _t.ticketType = res.rtData === null ? [] : res.rtData;
                        }
                    });
                }
            },
            // 获取车票库存状态字典
            getStatusData() {
                var _t = this;
                let str = 'guid=GUID000722201906191607';
                let Base64 = require('js-base64').Base64;
                let keyToken = _t.$md5(Base64.encode(str));
                var params = {
                    guid: 'GUID000722201906191607',
                    token: keyToken
                };
                _t.$api.post('/tsGateWay/ticketUtility/queryDict', params, function (res) {
                    // 查询成功
                    if (res.rtCode && res.rtCode === '14010') {
                        _t.statusList = res.rtData === null ? [] : res.rtData;
                    }
                });
            },
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
                        _t.getTicketType();
                        _t.getStatusData();
                        _t.getLinesAndStation();
                    }
                });
                // 判断权限按钮
                limitBtnArr.forEach((item) => {
                    // 查询按钮 权限
                    if (item.MENU_ID === 'GUID00000000000000000000000000000005') {
                        _t.limitBtn.queryBtn = true;
                    }
                    // 库存操作权限
                    if (item.MENU_ID === 'GUID00000000000000000000000000000006') {
                        _t.limitBtn.operation = true;
                    }
                });
            }
        }
    };
</script>

<style scoped>

</style>
