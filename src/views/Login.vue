<template>
  <div class="load_wrapper">
    <!--  标题区域  -->
    <div class="title_wrapper">
      <h1 class="title">{{formItem.title}}</h1>
      <h2 class="description">
        <span>欢迎使用&nbsp;</span>
        <span>{{formItem.description}}</span>
      </h2>
    </div>
    <!--  表单区域  -->
    <div v-if="isShowLoginForm" class="form_wrapper">
      <div class="title">账户登录</div>
      <el-form class="formLogin" :model="formModel">
        <el-form-item>
          <el-input
            placeholder="请输入账号"
            maxlength="12"
            v-model="formModel.user"
            @input="inputUser">
            <i slot="suffix" class="el-icon-user-solid fontSize18 marRight10"></i>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input
            placeholder="请输入密码"
            v-model="formModel.password"
            maxlength="12"
            @input="inputUser"
            @keyup.enter.native="loadBtn($event)"
            type="password">
            <i slot="suffix" class="el-icon-goods fontSize18 marRight10"></i>
          </el-input>
        </el-form-item>
        <el-form-item align="center" class="marBottom10">
          <el-button @click="loadBtn" type="primary" class="loginBtn">登录</el-button>
        </el-form-item>
      </el-form>
      <p class="titleTip" v-if="isError">{{formModel.loginTip}}</p>
    </div>
    <!--  版权栏区域  -->
    <div class="copyright">
      <span>{{formItem.copyright}}</span>
      <span>({{formItem.version}})</span>
    </div>
    <!--  选择位置区域  -->
    <el-dialog
      title="选择位置"
      :visible.sync="dialogVisible"
      append-to-body
      width="500px"
      :before-close="clearCache"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
      <el-table :data="tableData" stripe @row-click="rowClick" class="marBottom15">
        <el-table-column width="100px" align="center">
          <template slot-scope="scope">
            <el-radio
              @change.native="changeRadio(scope.row)"
              v-model="locationForm.id"
              :label="scope.row.LOCATION_NUMBER">&nbsp;
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column label="位置名称" prop="STATION_NAME"/>
      </el-table>
      <div slot="footer">
        <el-button type="primary" @click="handleClick">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
    export default {
        name: "Login",
        data() {
            return {
                // 登录表单
                formModel: {
                    user: '',
                    password: '',
                    loginTip: ''
                },
                // 校验提示
                isError: false,
                // 信息表单
                formItem: {
                    backgroundUrl: '', // 背景图地址
                    title: '呼和浩特票务系统',
                    description: '呼和浩特票务系统',
                    copyright: '方正国际软件有限公司 版权所有 1996-2016',
                    version: 'v6.7.22'
                },
                // 选择位置蒙版 默认首次登录 需要展示选中位置
                dialogVisible: true,
                // 位置列表
                tableData: [],
                // 是否显示登录表单
                isShowLoginForm: true,
                // 位置表单
                locationForm: {
                    id: '',
                    location_name: '', // 位置名称
                    location_number: '', // 位置编码
                    location_type_id: '', // 位置类型(和位置相关,09:车站 , 17:线路中心, 18:多线路)
                }
            }
        },
        methods: {
            // 输入校验
            inputUser() {
                var _t = this;
                if (_t.formModel.user.trim() === '' || _t.formModel.password.trim() === '') {
                    _t.formModel.loginTip = '账户名或密码不能为空!';
                    _t.isError = true;
                } else {
                    _t.formModel.loginTip = '';
                    _t.isError = false;
                }
            },
            // 登录按钮
            loadBtn(event) {
                var _t = this;
                event.preventDefault();
                // 校验账户名
                if (_t.formModel.user.trim() === '' || _t.formModel.password.trim() === '') {
                    _t.formModel.loginTip = '账户名或密码不能为空!';
                    _t.isError = true;
                } else if (_t.formModel.user.trim() !== '' && _t.formModel.password.trim() !== '') {
                    _t.isError = false;
                    _t.toLogin();
                } else {
                    _t.isError = false;
                }
            },
            // 发送登录请求
            toLogin() {
                var _t = this;
                var tokenString = 'userid' + '=' + _t.formModel.user.trim() + '&' + "password" + '=' + _t.formModel.password.trim();
                var Base64 = require('js-base64').Base64;
                var token = _t.$md5(Base64.encode(tokenString));
                var postData = {
                    userid: _t.formModel.user.trim(),
                    password: _t.formModel.password.trim(),
                    token: token
                };
                _t.$api.post('/tsGateWay/systemManager/login', postData, function (res) {
                    // 17005 登录成功
                    if (res.rtCode && res.rtCode === '17005') {
                        console.log(res)
                        // 设置userid
                        _t.setCookie('USER_ID', _t.formModel.user.trim());
                        // 判断 角色 是否包含 MLC 包含MLC 用MLC 否则用 SC
                        var resData = res.rtData;
                        if (resData && resData.length !== 0) {
                            // 处理用户信息
                            var Locationlist = resData[0].Locationlist ? resData[0].Locationlist : [];
                            if (Locationlist[0]) {
                                // 用户昵称
                                _t.setCookie('USER_NAME', Locationlist[0].USERNAME);
                            }
                            // 处理角色
                            var roleList = resData[0].Rolelist ? resData[0].Rolelist : [];
                            var isMLC = false;
                            var limitArr = new Array();
                            roleList.forEach((item) => {
                                if (item.ROLENAME === 'MLC') {
                                    isMLC = true;
                                    limitArr = item.Functionlist;
                                    // 设置 角色类型
                                    _t.setCookie('USER_TYPE', item.ROLENAME);
                                }
                            });
                            // 没有MLC
                            if (isMLC === false) {
                                roleList.forEach((item) => {
                                    if (item.ROLENAME === 'SC') {
                                        limitArr = item.Functionlist;
                                        // 设置 角色类型
                                        _t.setCookie('USER_TYPE', item.ROLENAME);
                                    }
                                });
                            }
                            // 设置路由缓存
                            localStorage.setItem('MENU_LIST', JSON.stringify(limitArr));
                            // 显示选择位置表格
                            _t.getData(Locationlist);
                        }
                    } else if (res.rtCode === '24004' || res.rtCode === '24001') {
                        // 24004 查无此人 24001 密码校验失败
                        _t.alertDialogTip(_t, res.rtMessage);
                    } else {
                        _t.alertDialogTip(_t, '登录失败');
                    }
                });
            },
            // 清除缓存
            clearCache() {
                var _t = this;
                _t.delCookie('USER_ID');
                _t.delCookie('USER_NAME');
                _t.delCookie('USER_TYPE');
                _t.delCookie('LOCATION_NUMBER');
                _t.delCookie('LOCATION_NUMBER_NAME');
                _t.delCookie('LOCATION_TYPE_ID');
                localStorage.removeItem('MENU_LIST');
                localStorage.removeItem('limitMenuList');
                localStorage.removeItem('LOCATION_INFO');
                localStorage.removeItem('BOM_TYPE');
                localStorage.removeItem('TVM_TYPE');
                _t.isShowLoginForm = true;
                _t.dialogVisible = false;
                _t.locationForm.location_number = '';
                _t.locationForm.location_name = '';
                _t.$store.commit('resetState', true);
            },
            // 获取缓存的位置信息
            getData(tableData) {
                var _t = this;
                // 遍历缓存的位置信息
                tableData.forEach((item) => {
                    // 字段重置,防止字段为空
                    item.LOCATION_NUMBER = item.LOCATION_NUMBER ? item.LOCATION_NUMBER : '';
                    item.STATION_NAME = item.STATION_NAME ? item.STATION_NAME : '';
                });
                _t.tableData = tableData;
                // 判断位置条数只有一条时直接登录
                if (_t.tableData.length === 1) {
                    _t.setCookie('LOCATION_NUMBER', _t.tableData[0].LOCATION_NUMBER);
                    _t.setCookie('LOCATION_NUMBER_NAME', _t.tableData[0].STATION_NAME);
                    _t.setCookie('LOCATION_TYPE_ID', _t.tableData[0].LOCATION_TYPE_ID);
                    // 隐藏选择位置弹出层
                    _t.dialogVisible = false;
                    // 显示登录表单区域
                    _t.isShowLoginForm = true;
                    _t.$router.push({name: 'index'});
                } else {
                    // 显示选择位置弹出层
                    _t.dialogVisible = true;
                    // 隐藏登录表单区域
                    _t.isShowLoginForm = false;
                }
            },
            // 点击选择车站按钮
            handleClick() {
                var _t = this;
                if (_t.locationForm.location_number !== '') {
                    // 可以提交 设置location_number 及 location_name
                    _t.setCookie('LOCATION_NUMBER', _t.locationForm.location_number);
                    _t.setCookie('LOCATION_NUMBER_NAME', _t.locationForm.location_name);
                    _t.setCookie('LOCATION_TYPE_ID', _t.locationForm.location_type_id);
                    // 隐藏选择位置蒙版
                    _t.dialogVisible = false;
                    // 显示登录表单
                    _t.isShowLoginForm = true;
                    // 进入系统
                    _t.$router.push({name: 'index'});
                } else {
                    // 未选中车站
                    _t.alertDialogTip(_t, '请选择一个车站');
                }
            },
            // 改变 表格的 单选按钮
            changeRadio(row) {
                var _t = this;
                _t.locationForm.id = row.LOCATION_NUMBER; // id
                _t.locationForm.location_number = row.LOCATION_NUMBER; // 位置编码
                _t.locationForm.location_name = row.STATION_NAME; // 位置名称
                _t.locationForm.location_type_id = row.LOCATION_TYPE_ID; // 位置类型
            },
            // 点击表格行
            rowClick(row) {
                var _t = this;
                _t.changeRadio(row);
            },
        },
        created() {
            this.clearCache();
        }
    }
</script>
<style scoped>
  .load_wrapper {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("../../src/assets/img/login_bg.jpg") no-repeat center center/ 100% 100%;
  }

  .title_wrapper {
    position: absolute;
    left: 30%;
    top: 45%;
    height: 300px;
    color: #fff;
    transform: translate(-50%, -50%);
  }

  .title_wrapper .title {
    font-size: 40px;
    margin-bottom: 50px;
  }

  .title_wrapper .description {
    font-size: 30px;
  }

  .form_wrapper {
    position: absolute;
    left: 70%;
    top: 45%;
    width: 430px;
    height: 300px;
    transform: translate(-50%, -50%);
    background-color: #fff !important;
    padding: 10px 30px;
    border-radius: 10px;
    border: 1px solid #fff;
    color: #fff;
    font-size: 14px;
  }

  .form_wrapper .title {
    font-size: 30px;
    text-align: center;
    color: #333;
    height: 55px;
    line-height: 55px;
    margin-bottom: 15px;
  }

  .loginBtn {
    width: 100%;
  }

  .titleTip {
    color: #fb6041;
    text-align: center;
  }

  .copyright {
    height: 50px;
    line-height: 50px;
    text-align: center;
    font-size: 14px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    color: #fff;
  }
</style>
<style>
  .formLogin label.el-form-item__label {
    font-weight: bold;
  }
</style>
