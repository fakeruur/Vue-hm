<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!--搜索框区域-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="searchGetGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="searchGetGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" round @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!--table 表格区域-->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="110px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="90px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="160px">
          <!--调用过滤器实现时间格式化-->
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit"></el-button>
            <el-button type="danger" icon="el-icon-delete" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination @size-change="handleSizeChange" background
                     @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
                     :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'List',
    data() {
      return {
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        goodsList: [],
        total: 0
      }
    },

    created() {
      this.getGoodsList()
    },

    methods: {
      //根据分页获取对应的商品列表
      async getGoodsList() {
        const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.goodsList = res.data.goods
        this.total = res.data.total
      },
      //分页
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getGoodsList()
      },
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getGoodsList()
      },

      //搜索
      searchGetGoodsList() {
        this.queryInfo.pagenum = 1
        this.getGoodsList()
      },
      //根据id删除商品
      async removeById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          return
        }
        const { data: res } = await this.$http.delete(`goods/${id}`)
        if (res.meta.status !== 200) return
        this.$message.success(res.meta.msg)
        this.getGoodsList()
      },

      //添加商品
      goAddPage(){
        this.$router.push('/goods/add')
      }
    }
  }
</script>

<style lang="less" scoped>

</style>