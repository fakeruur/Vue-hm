<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图-->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!--订单列表-->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" icon="el-icon-edit" @click="showBox"></el-button>
            <el-button type="success" icon="el-icon-location" @click="showPropressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!--修改地址的对话框-->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :props="cityDateProps" :options="cityDate" v-model="addressForm.address1" clearable
                       filterable></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="addressVisible = false">取 消</el-button>
          <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!--展示快递进度对话框-->
    <el-dialog title="物流进度" :visible.sync="propressVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in propressInfo"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
  import cityDate from './citydata'

  export default {
    name: 'Order',
    data() {
      return {
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        total: 0,
        orderList: [],


        addressVisible: false,
        addressForm: {
          address1: [],
          address2: ''
        },
        addressFormRules: {
          address1: [
            { required: true, message: '选择地址', trigger: 'blur' }
          ],
          address2: [
            { required: true, message: '填写地址', trigger: 'blur' }
          ]
        },
        cityDate,
        cityDateProps: {
          expandTrigger: 'hover',
          value: 'value',
          label: 'label',
          children: 'children'
        },

        propressVisible: false,
        propressInfo: []


      }
    },

    created() {
      this.getOrderList()
    },

    methods: {
      async getOrderList() {
        const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
        this.total = res.data.total
        this.orderList = res.data.goods
      },
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getOrderList()
      },
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getOrderList()
      },

      // 修改地址的对话框
      showBox() {
        this.addressVisible = true
      },
      addressDialogClosed() {
        this.$refs.addressFormRef.resetFields()
      },
      //物流进度对话框
      async showPropressBox() {
        const { data: res } = await this.$http.get('/kuaidi/1106975712662')
        this.propressInfo = res.data
        this.propressVisible = true
      }
    }
  }
</script>

<style lang="less" scoped>

</style>