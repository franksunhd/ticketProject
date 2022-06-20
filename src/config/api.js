// 引入axios
import axios from 'axios';

// 所有接口的 base_url 前缀
var root = 'http://172.18.71.104:8229';

function apiAxios(method, url, params, success) {
  axios({
    method: method, // 请求方式 post get delete get等
    url: url, // 具体接口地址
    data: method === 'POST' || method === 'PUT' ? params : null,
    params: method === 'GET' || method === 'DELETE' ? params : null,
    baseURL: root, // base_url
    withCredentials: false,  // cookie
    headers: {
      'Content-Type': 'application/json;charset=utf-8', // 请求头
    }
  }).then(function (res) {
    // 成功时回调
    if (typeof res.data === 'string') {
      var stringData = res.data;
      if (stringData.indexOf('27004') !== -1) {
        alert('服务调用失败');
      }
    } else {
      if (success) {
        success(res.data);
      }
    }
  }).catch(function (err) {
    // 异常时回调
    alert(err);
    return false;
  });
}

// 返回在vue模板中的调用接口
export default {
  // 查询
  get: function (url, params, success) {
    return apiAxios('GET', url, params, success);
  },
  // 修改
  post: function (url, params, success) {
    return apiAxios('POST', url, params, success);
  },
  // 更新
  put: function (url, params, success) {
    return apiAxios('PUT', url, params, success);
  },
  // 删除
  delete: function (url, params, success) {
    return apiAxios('DELETE', url, params, success);
  }
}
