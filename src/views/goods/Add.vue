<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!--提示-->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>

      <!--步骤条-->
      <el-steps :space="270" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                clearable
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!--渲染表单的item项-->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!--复选框-->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="cb" v-for="(cb,i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--上传组件没有调用axios-->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :headers="headerObj"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--富文本编辑器-->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" round class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!--图片预览对话框-->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%">
      <img :src="previewPath" alt="picture" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'

  export default {
    name: 'Add',
    data() {
      return {
        activeIndex: '0',
        //表单的
        addForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          //商品所属的分类数组
          goods_cat: [],
          //图片的数组
          pics: [],
          //富文本，商品的详情描述
          goods_introduce: '',
          //动态和静态的属性参数
          attrs: []
        },
        addFormRules: {
          goods_name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' }
          ],
          goods_price: [
            { required: true, message: '请输入商品价格', trigger: 'blur' }
          ],
          goods_weight: [
            { required: true, message: '请输入商品重量', trigger: 'blur' }
          ],
          goods_number: [
            { required: true, message: '请输入商品数量', trigger: 'blur' }
          ],
          goods_cat: [
            { required: true, message: '请选择商品分类', trigger: 'blur' }
          ]
        },
        //级联框的商品数据列表
        cateList: [],
        //级联框的配置
        cateProps: {
          expandTrigger: 'hover',
          label: 'cat_name',
          value: 'cat_id',
          children: 'children'
        },
        //商品参数页面，动态参数
        manyTableData: [],
        //商品属性页面，静态属性
        onlyTabData: [],

        //图片上传组件的headersqingqiut
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        //图片预览时的地址
        previewPath: '',
        //控制图片预览对话框
        previewVisible: false

      }
    },

    computed: {
      cateId() {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2]
        }
        return null
      }
    },

    created() {
      this.getCateList()
    },

    methods: {
      async getCateList() {
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取失败')
        }
        this.cateList = res.data
      },
      //级级联选择器变化触发函数
      handleChange() {
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = []
        }
      },

      beforeTabLeave(activeName, oldActiveName) {
        if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
          this.$message.error('请选择分类')
          return false
        }
      },
      //tab栏切换事件
      async tabClicked() {
        if (this.activeIndex === '1') {
          const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
          })
          this.manyTableData = res.data
        } else if (this.activeIndex === '2') {
          const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.onlyTabData = res.data
        }
      },

      //图片预览
      handlePreview(file) {
        this.previewPath = file.response.data.url
        this.previewVisible = true
      },
      handleRemove(file) {
        //获得要移除的图片的临时路径
        const filePath = file.response.data.temp_path
        //根据路径把pic中索引值找到
        const i = this.addForm.pics.findIndex(x => x.pic === filePath)
        this.addForm.pics.splice(i, 1)
      },
      //监听图片上传成功事件
      handleSuccess(response) {
        //拼接得到一个图片的信息对象
        const picInfo = { pic: response.data.tmp_path }
        //将图片信息对象，push到pics数组中
        this.addForm.pics.push(picInfo)
      },
      //添加商品
      add() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请填必要的表单项')
          }
          //执行添加的业务逻辑
          //lodash  cloneDeep(obj)
          //深拷贝addForm，再来操作  不影响之前表单的双向绑定，
          const form = _.cloneDeep(this.addForm)
          form.goods_cat = form.goods_cat.join(',')
          //处理动态参数和静态属性
          this.manyTableData.forEach(item => {
            const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(',') }
            this.addForm.attrs.push(newInfo)
          })
          this.onlyTabData.forEach(item => {
            const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
            this.addForm.attrs.push(newInfo)
          })
          form.attrs = this.addForm.attrs
          //发起请求
          const { data: res } = await this.$http.post('goods', form)
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success('添加商品成功!')
          this.$router.push('/goods')
        })
      }

    }
  }
</script>

<style lang="less" scoped>

  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }

  .previewImg {
    width: 100%;
  }

  .btnAdd {
    margin-top: 15px;
  }
</style>