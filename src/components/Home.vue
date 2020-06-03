<template>
  <el-container class="home-container">
    <!--头部-->
    <el-header style="height: 75px">
      <div>
        <img id="amd" src="../assets/home.jpg" alt="home">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--主体区域-->
    <el-container>
      <!--侧边栏-->
      <el-aside :style="{width:collapseWidth}">
        <div class="toggle-utton" @click="toggleCollapse">|||</div>
        <!--侧边栏菜单区域-->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath">
          <!--一级菜单-->
          <el-submenu :index="item.id + ''" v-for="item in menlist" :key="item.id">
            <!--一级菜单模板-->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id"
                          @click="saveNavState('/'+subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右侧内容-->
      <el-main>
        <!--路由占位符-->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: 'Home',
    data() {
      return {
        menlist: [],
        iconsObj: {
          125: 'el-icon-s-custom',
          103: 'el-icon-s-promotion',
          101: 'el-icon-s-shop',
          102: 'el-icon-s-order',
          145: 'el-icon-s-data'
        },
        //是否折叠
        isCollapse: false,
        //被激活的链接
        activePath: ''

      }
    },
    //生命周期函数
    created() {
      this.getMenuList()
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    //计算属性
    computed: {
      collapseWidth() {
        return this.isCollapse ? '64px' : '200px'
      }
    },
    methods: {
      logout() {
        window.sessionStorage.clear()
        this.$router.push('/login')
        this.$message.success('退出成功')
      },
      //获取所有菜单方法
      async getMenuList() {
        const { data: res } = await this.$http.get('menus')
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.menlist = res.data
        console.log(res)
      },
      //切换菜单折叠和展开
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
      },
      //保存连接的激活状态
      saveNavState(activePath) {
        window.sessionStorage.setItem('activePath', activePath)
        this.activePath = activePath
      }
    }
  }
</script>

<style lang="less" scoped>

  .home-container {
    height: 100%;
  }

  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;

    > div {
      display: flex;
      align-items: center;

      span {
        margin-left: 15px;
      }
    }


    #amd {
      height: 75px;
      border-radius: 50%;
    }

  }


  .el-aside {
    background-color: #333744;

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #EAEDF1;
  }

  .toggle-utton {
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: #ffffff;
    text-align: center;
    //字符间距
    letter-spacing: 0.2em;
    //遍鼠标
    cursor: pointer;
  }
</style>