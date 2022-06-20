<template>
    <div id="app">
        <el-row :gutter="20">
            <el-col>

            </el-col>
        </el-row>
    </div>
</template>
<script>
    import menu from './assets/js/data';

    export default {
        name: 'App',
        data() {
            return {}
        },
        methods: {
            // 一维数组转换树
            translateDataToTree(treeArray) {
                var data = [...treeArray];
                var tree = data.filter((father) => {
                    var branchArr = data.filter((child) => {
                        if (father['MENU_ID'] === child['PARENT_ID']) child._hasParent = true;
                        return father['MENU_ID'] === child['PARENT_ID'];
                    });
                    if (branchArr.length > 0) father['CHILDREN'] = branchArr;
                    return !father._hasParent;
                });

                // MARK 为什么在这里还得加一个过滤
                tree = tree.filter((item) => {
                    return !item._hasParent;
                });
                return tree;
            },
            // 递归将树形转为扁平
            getTreeList(arr, result) {
                var self = this;
                arr.forEach(function (item) {
                    if (item !== undefined && item !== null) {
                        if (item.CHILDREN !== undefined && item.CHILDREN !== null) {
                            result.push(item);
                            self.getTreeList(item.CHILDREN, result)
                        } else {
                            result.push(item);
                        }
                    }
                });
                return result;
            },
            // 去除数组中menu_id相同的对象
            returnIsNotData(data) {
                let hash = {};
                return data.reduce((pre, cur) => {
                    hash[cur.MENU_ID] ? '' : hash[cur.MENU_ID] = true && pre.push(cur);
                    return pre;
                }, []);
            },
            // 处理数据
            dealWithData() {
                var _t = this;
                console.time('aaa');
                if (menu.rtCode === '17005') {
                    if (menu.rtData !== undefined && menu.rtData !== null) {
                        if (menu.rtData.length !== 0 && menu.rtData[0].Rolelist !== undefined && menu.rtData[0].Rolelist !== null) {
                            // 获取角色关联的菜单集合
                            var roleList = menu.rtData[0].Rolelist;
                            var menuList = new Array(); // 一维数组 用于缓存转换后的菜单集合
                            // 遍历集合 将菜单树转为一维数组
                            roleList.forEach((item) => {
                                if (item.Functionlist !== undefined && item.Functionlist !== null) {
                                    // 每个角色下的菜单递归转为一维数组
                                    var funList = _t.getTreeList(item.Functionlist, []);
                                    funList.forEach((val) => {
                                        if (val !== undefined && val !== null) {
                                            menuList.push(val);
                                        }
                                    });
                                }
                            });
                            // 去重后的一维数组
                            var oldArr = _t.returnIsNotData(menuList);
                            console.log(oldArr);
                            // 新的树
                            var newTree = _t.translateDataToTree(_t.returnIsNotData(menuList));
                            console.log(newTree);
                        }
                    }
                }
                console.timeEnd('aaa');
            }
        },
        created() {
            var _t = this;
            _t.dealWithData();
        }
    }
</script>
