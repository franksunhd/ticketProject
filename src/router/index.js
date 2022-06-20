import Vue from 'vue';
import Router from 'vue-router';
// 主页面
const Index = () => import('@/views/index');
// 登录页
const Login = () => import('@/views/Login');
// 首页
const Home = () => import('@/views/Home');
// 车票库存变更
const ticketStockChange = () => import('@/views/ticket/ticketStock/ticketStockChange');
// 车票库存操作记录
const ticketStockRecord = () => import('@/views/ticket/ticketStock/ticketStockRecord');
// 车票库存盘点
const ticketStockInventory = () => import('@/views/ticket/ticketStock/ticketStockInventory');
// 车票调拨
const ticketTransfers = () => import('@/views/ticket/ticketAllocate/ticketTransfers');
// 车票配发
const ticketAllotment = () => import('@/views/ticket/ticketAllocate/ticketAllotment');
// 车票上交
const ticketUpper = () => import('@/views/ticket/ticketAllocate/ticketUpper');
// AG回收
const AGRecycle = () => import('@/views/ticket/ticketRecycle/AGRecycle');
// MLC回收SC库存
const MLCRecycle = () => import('@/views/ticket/ticketRecycle/MLCRecycle');
// 备用金库存变更
const moneyStockChange = () => import('@/views/spareMoney/spareMoneyStock/moneyStockChange');
// 备用金库存操作记录
const moneyStockRecord = () => import('@/views/spareMoney/spareMoneyStock/moneyStockRecord');
// 备用金调配的配发
const spareAllotment = () => import('@/views/spareMoney/spareMoneyAllocate/spareAllotment');
// 备用金调配的上交
const spareUpper = () => import('@/views/spareMoney/spareMoneyAllocate/spareUpper');
// 备用金调配的回收
const spareRecycle = () => import('@/views/spareMoney/spareMoneyAllocate/spareRecycle');
// 收益管理库存变更
const profitStockChange = () => import('@/views/profit/profitStock/profitStockChange');
// 收益管理库存操作记录
const profitStockRecord = () => import('@/views/profit/profitStock/profitStockRecord');
// 长短款管理
const profitLengthChange = () => import('@/views/profit/profitLength/profitLengthChange');
// 长短款补款单据
const profitLengthBills = () => import('@/views/profit/profitLength/profitLengthBills');
// 收益解行
const profitSolution = () => import('@/views/profit/profitSolution/profitSolution');
// 审核管理 -> BOM操作单
const BOMOperation = () => import('@/views/examine/BOM/BOMOperation');
// 审核管理 -> BOM结算单
const BOMSettlement = () => import('@/views/examine/BOM/BOMSettlement');
// 审核管理 -> BOM操作单 -> 详情
const BOMOperationDetail = () => import('@/views/examine/BOM/BOMOperationDetail');
// 审核管理 -> BOM操作单 -> 配票备用金
const BOMOperationAdd = () => import('@/views/examine/BOM/BOMOperationAdd');
// 审核管理 -> BOM操作单 -> 追加备用金
const BOMOperationEdit = () => import('@/views/examine/BOM/BOMOperationEdit');
// 审核管理 -> BOM操作单 -> 收益预收
const BOMOperationAdvance = () => import('@/views/examine/BOM/BOMOperationAdvance');
// 审核管理 -> BOM操作单 -> 回收
const BOMOperationRecycle = () => import('@/views/examine/BOM/BOMOperationRecycle');
// 审核管理 -> TVM操作单
const TVMOperation = () => import('@/views/examine/TVM/TVMOperation');
// 审核管理 -> TVM结算单
const TVMSettlement = () => import('@/views/examine/TVM/TVMSettlement');
// 审核管理 -> TVM操作单 -> 详情
const TVMOperationDetail = () => import('@/views/examine/TVM/TVMOperationDetail');

// 审核管理 -> TVM操作单 -> 装机
const TVMOperationAdd = () => import('@/views/examine/TVM/TVMOperationAdd');
// 审核管理 -> TVM操作单 -> 补充
const TVMOperationEdit = () => import('@/views/examine/TVM/TVMOperationEdit');
// 审核管理 -> TVM操作单 -> 清点
const TVMOperationAdvance = () => import('@/views/examine/TVM/TVMOperationAdvance');
// 审核管理 -> TVM操作单 -> 回收
const TVMOperationRecycle = () => import('@/views/examine/TVM/TVMOperationRecycle');

// 系统管理 -> 用户管理
const userMaintenance = () => import('@/views/system/user/userMaintenance');
// 系统管理 -> 角色管理
const roleMaintenance = () => import('@/views/system/user/roleMaintenance');
// 系统管理 -> 位置管理
const locationMaintenance = () => import('@/views/system/user/locationMaintenance');
// 系统管理 -> 菜单管理
const menuMaintenance = () => import('@/views/system/user/menuMaintenance');
// 系统管理 -> 基础参数管理
const basicMaintenance = () => import('@/views/system/parameter/basicMaintenance');
// 系统管理 -> 码表管理
const codeMaintenance = () => import('@/views/system/parameter/codeMaintenance');
// 系统管理 -> 设备管理
const equipmentMaintenance = () => import('@/views/system/parameter/equipmentMaintenance');
// 系统管理 -> 车站管理
const stationMaintenance = () => import('@/views/system/parameter/stationMaintenance');
// 系统管理 -> 定时任务管理
const taskMaintenance = () => import('@/views/system/parameter/taskMaintenance');
// 系统管理 -> 票种管理
const ticketMaintenance = () => import('@/views/system/parameter/ticketMaintenance');
// 系统管理 -> 车票管理类型
const typeMaintenance = () => import('@/views/system/parameter/typeMaintenance');

Vue.use(Router);

const fixedRouter = [
  // 路由重定向
  {path: "/", redirect: "/index"},
  {
    path: '/index', name: 'Index', component: Index, children: [
      // Home页
      {
        path: "/index",
        name: 'index',
        meta: {title: '首页'},
        component: Home
      },
      // 车票管理 -> 库存管理 -> 库存变更
      {
        path: "/ticket/ticketStock/ticketStockChange",
        name: "ticketStockChange",
        meta: {title: '车票库存变更'},
        component: ticketStockChange
      },
      // 车票管理 -> 库存管理 -> 库存操作记录
      {
        path: "/ticket/ticketStock/ticketStockRecord",
        name: "ticketStockRecord",
        meta: {title: '车票库存操作记录'},
        component: ticketStockRecord
      },
      // 车票管理 -> 库存管理 -> 库存盘点
      {
        path: "/ticket/ticketStock/ticketStockInventory",
        name: "ticketStockInventory",
        meta: {title: '车票库存盘点'},
        component: ticketStockInventory
      },
      // 车票管理 -> 车票调配 -> 车票调拨
      {
        path: "/ticket/ticketAllocate/ticketTransfers",
        name: "ticketTransfers",
        meta: {title: '车票调拨'},
        component: ticketTransfers
      },
      // 车票管理 -> 车票调配 -> 车票上交
      {
        path: "/ticket/ticketAllocate/ticketUpper",
        name: "ticketUpper",
        meta: {title: '车票上交'},
        component: ticketUpper
      },
      // 车票管理 -> 车票调配 -> 车票配发
      {
        path: "/ticket/ticketAllocate/ticketAllotment",
        name: "ticketAllotment",
        meta: {title: '车票车票配发'},
        component: ticketAllotment
      },
      // 车票管理 -> 车票回收 -> AG回收
      {
        path: "/ticket/ticketRecycle/AGRecycle",
        name: "AGRecycle",
        meta: {title: 'AG回收'},
        component: AGRecycle
      },
      // 车票管理 -> 车票回收 -> MLC回收SC库存
      {
        path: "/ticket/ticketRecycle/MLCRecycle",
        name: "MLCRecycle",
        meta: {title: 'MLC回收SC车票'},
        component: MLCRecycle
      },
      // 备用金管理 -> 库存管理 -> 库存变更
      {
        path: "/ticket/spareMoneyStock/moneyStockChange",
        name: "moneyStockChange",
        meta: {title: '备用金库存变更'},
        component: moneyStockChange
      },
      // 备用金管理 -> 库存管理 -> 库存操作记录
      {
        path: "/ticket/spareMoneyStock/moneyStockRecord",
        name: "moneyStockRecord",
        meta: {title: '备用金库存操作记录'},
        component: moneyStockRecord
      },
      // 备用金管理 -> 备用金调配 -> 配发
      {
        path: "/ticket/spareMoneyAllocate/spareAllotment",
        name: "spareAllotment",
        meta: {title: '备用金配发'},
        component: spareAllotment
      },
      // 备用金管理 -> 备用金调配 -> 上交
      {
        path: "/ticket/spareMoneyAllocate/spareUpper",
        name: "spareUpper",
        meta: {title: '备用金上交'},
        component: spareUpper
      },
      // 备用金管理 -> 备用金调配 -> 回收
      {
        path: "/ticket/spareMoneyAllocate/spareRecycle",
        name: "spareRecycle",
        meta: {title: '备用金回收'},
        component: spareRecycle
      },
      // 收益管理 -> 库存管理 -> 库存变更
      {
        path: "/ticket/profitStock/profitStockChange",
        name: "profitStockChange",
        meta: {title: '收益库存变更'},
        component: profitStockChange
      },
      // 收益管理 -> 库存管理 -> 库存操作记录
      {
        path: "/ticket/profitStock/profitStockRecord",
        name: "profitStockRecord",
        meta: {title: '收益库存操作记录'},
        component: profitStockRecord
      },
      // 收益管理 -> 长短款管理 -> 长短款管理
      {
        path: "/ticket/profitLength/profitLengthChange",
        name: "profitLengthChange",
        meta: {title: '长短款管理'},
        component: profitLengthChange
      },
      // 收益管理 -> 长短款管理 -> 长短款补款单据
      {
        path: "/ticket/profitLength/profitLengthBills",
        name: "profitLengthBills",
        meta: {title: '长短款补款单据'},
        component: profitLengthBills
      },
      // 收益管理 -> 收益解行 -> 收益解行
      {
        path: "/ticket/profitSolution/profitSolution",
        name: "profitSolution",
        meta: {title: '收益解行'},
        component: profitSolution
      },
      // 审核管理 -> BOM管理 -> BOM操作单管理
      {
        path: "/ticket/BOM/BOMOperation",
        name: "BOMOperation",
        meta: {title: 'BOM操作单管理'},
        component: BOMOperation
      },
      // 审核管理 -> BOM管理 -> BOM操作单管理 -> 详情
      {
        path: "/ticket/BOM/BOMOperation/BOMOperationDetail",
        name: "BOMOperationDetail",
        meta: {title: 'BOM操作单管理详情', level: 4},
        component: BOMOperationDetail
      },
      // 审核管理 -> BOM管理 -> BOM操作单管理 -> 配票备用金
      {
        path: "/ticket/BOM/BOMOperation/BOMOperationAdd",
        name: "BOMOperationAdd",
        meta: {title: 'BOM配票/备用金', level: 4},
        component: BOMOperationAdd
      },
      // 审核管理 -> BOM管理 -> BOM操作单管理 -> 追加票/备用金
      {
        path: "/ticket/BOM/BOMOperation/BOMOperationEdit",
        name: "BOMOperationEdit",
        meta: {title: 'BOM追加票/备用金', level: 4},
        component: BOMOperationEdit
      },
      // 审核管理 -> BOM管理 -> BOM操作单管理 -> 收益预收
      {
        path: "/ticket/BOM/BOMOperation/BOMOperationAdvance",
        name: "BOMOperationAdvance",
        meta: {title: 'BOM收益预收', level: 4},
        component: BOMOperationAdvance
      },
      // 审核管理 -> BOM管理 -> BOM操作单管理 -> 回收
      {
        path: "/ticket/BOM/BOMOperation/BOMOperationRecycle",
        name: "BOMOperationRecycle",
        meta: {title: 'BOM回收', level: 4},
        component: BOMOperationRecycle
      },
      // 审核管理 -> BOM管理 -> BOM结算单管理
      {
        path: "/ticket/BOM/BOMSettlement",
        name: "BOMSettlement",
        meta: {title: 'BOM结算单管理'},
        component: BOMSettlement
      },
      // 审核管理 -> TVM管理 -> TVM操作单管理
      {
        path: "/ticket/TVM/TVMOperation",
        name: "TVMOperation",
        meta: {title: 'TVM操作单管理'},
        component: TVMOperation
      },
      // 审核管理 -> TVM管理 -> TVM操作单管理 -> 详情
      {
        path: "/ticket/TVM/TVMOperation/TVMOperationDetail",
        name: "TVMOperationDetail",
        meta: {title: 'TVM操作单管理详情', level: 4},
        component: TVMOperationDetail
      },
      // 审核管理 -> TVM管理 -> TVM操作单管理 -> 装机
      {
        path: "/ticket/TVM/TVMOperation/TVMOperationAdd",
        name: "TVMOperationAdd",
        meta: {title: 'TVM装机', level: 4},
        component: TVMOperationAdd
      },
      // 审核管理 -> TVM管理 -> TVM操作单管理 -> 补充
      {
        path: "/ticket/TVM/TVMOperation/TVMOperationEdit",
        name: "TVMOperationEdit",
        meta: {title: 'TVM补充', level: 4},
        component: TVMOperationEdit
      },
      // 审核管理 -> TVM管理 -> TVM操作单管理 -> 清点
      {
        path: "/ticket/TVM/TVMOperation/TVMOperationAdvance",
        name: "TVMOperationAdvance",
        meta: {title: 'TVM清点', level: 4},
        component: TVMOperationAdvance
      },
      // 审核管理 -> TVM管理 -> TVM操作单管理 -> 回收
      {
        path: "/ticket/TVM/TVMOperation/TVMOperationRecycle",
        name: "TVMOperationRecycle",
        meta: {title: 'TVM回收', level: 4},
        component: TVMOperationRecycle
      },
      // 审核管理 -> TVM管理 -> TVM结算单管理
      {
        path: "/ticket/TVM/TVMSettlement",
        name: "TVMSettlement",
        meta: {title: 'TVM结算单管理'},
        component: TVMSettlement
      },
      // 系统管理 -> 用户管理 -> 用户管理
      {
        path: "/ticket/user/userMaintenance",
        name: "userMaintenance",
        meta: {title: '用户管理'},
        component: userMaintenance
      },
      // 系统管理 -> 用户管理 -> 角色管理
      {
        path: "/ticket/user/roleMaintenance",
        name: "roleMaintenance",
        meta: {title: '角色管理'},
        component: roleMaintenance
      },
      // 系统管理 -> 用户管理 -> 位置管理
      {
        path: "/ticket/user/locationMaintenance",
        name: "locationMaintenance",
        meta: {title: '位置管理'},
        component: locationMaintenance
      },
      // 系统管理 -> 用户管理 -> 菜单管理
      {
        path: "/ticket/user/menuMaintenance",
        name: "menuMaintenance",
        meta: {title: '菜单管理'},
        component: menuMaintenance
      },
      // 系统管理 -> 参数管理 -> 基础参数管理
      {
        path: "/ticket/parameter/basicMaintenance",
        name: "basicMaintenance",
        meta: {title: '基础参数管理'},
        component: basicMaintenance
      },
      // 系统管理 -> 参数管理 -> 码表管理
      {
        path: "/ticket/parameter/codeMaintenance",
        name: "codeMaintenance",
        meta: {title: '码表管理'},
        component: codeMaintenance
      },
      // 系统管理 -> 参数管理 -> 设备管理
      {
        path: "/ticket/parameter/equipmentMaintenance",
        name: "equipmentMaintenance",
        meta: {title: '设备管理'},
        component: equipmentMaintenance
      },
      // 系统管理 -> 参数管理 -> 车站管理
      {
        path: "/ticket/parameter/stationMaintenance",
        name: "stationMaintenance",
        meta: {title: '车站管理'},
        component: stationMaintenance
      },
      // 系统管理 -> 参数管理 -> 定时任务管理
      {
        path: "/ticket/parameter/taskMaintenance",
        name: "taskMaintenance",
        meta: {title: '定时任务管理'},
        component: taskMaintenance
      },
      // 系统管理 -> 参数管理 -> 票种管理
      {
        path: "/ticket/parameter/ticketMaintenance",
        name: "ticketMaintenance",
        meta: {title: '票种管理'},
        component: ticketMaintenance
      },
      // 系统管理 -> 参数管理 -> 车票管理类型
      {
        path: "/ticket/parameter/typeMaintenance",
        name: "typeMaintenance",
        meta: {title: '车票管理类型'},
        component: typeMaintenance
      },
    ]
  },
  {path: '/login', name: 'Login', component: Login}
];
export default new Router({
  routes: fixedRouter
});
