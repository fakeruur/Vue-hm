<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区-->
    <el-card>
      <!--注意事项-->
      <el-alert title="注意：只允许为第三极分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>

      <!--  选择商品分类区域  -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框-->
          <el-cascader v-model="selectedCateKeys" :options="cataList" :props="cateProps"
                       @change="handleChange"></el-cascader>
        </el-col>
      </el-row>

      <!-- Tap页签区域-->
      <el-tabs v-model="activeName" @tab-click="handleTapClick">

        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled"
                     @click="addTextDialogVisible=true">添加参数
          </el-button>

          <!--动态参数表格-->
          <el-table :data="manyTableData" border stripe>
            <!--展开行-->
            <el-table-column label="^" type="expand">
              <template slot-scope="scope">
                <!--循环渲染Tag标签-->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable
                        @close="handleClose(i,scope.row)">{{item}}
                </el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!--索引列-->
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete"
                           @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--静态参数表格-->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled"
                     @click="addTextDialogVisible=true">添加属性
          </el-button>
          <el-table :data="onlyTabData" border stripe>
            <!--展开行-->
            <el-table-column label="^" type="expand">
              <template slot-scope="scope">
                <!--循环渲染Tag标签-->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable
                        @close="handleClose(i,scope.row)">{{item}}
                </el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <!--索引列-->
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete"
                           @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框-->
    <el-dialog :title="'添加'+titleText" :visible.sync="addTextDialogVisible"
               width="30%" @close="addTextDialogClosed">
      <el-form @submit.native.prevent :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name" @keyup.enter.native="addParams"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addTextDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改参数名称对话框-->
    <el-dialog :title="'修改'+titleText" :visible.sync="editTextDialogVisible"
               width="30%" @close="editTextDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editTextDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>


  </div>
</template>

<script>
  export default {
    name: 'Params',
    data() {
      return {
        cataList: [],
        cateProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        selectedCateKeys: [],

        //被激活的页签的名称
        activeName: 'many',
        //动态和静态参数的数据
        manyTableData: [],
        onlyTabData: [],

        //控制添加参数对话框的显示和隐藏
        addTextDialogVisible: false,
        addForm: {
          attr_name: ''
        },
        addFormRules: {
          attr_name: [
            { required: true, message: '请输入参数名称', trigger: 'blur' }
          ]
        },

        //控制修改对话框的显示和隐藏
        editTextDialogVisible: false,
        editForm: {},
        editFormRules: {
          attr_name: [
            { required: true, message: '请输入参数名称', trigger: 'blur' }
          ]
        }


      }
    },

    computed: {
      //如果按钮需要被禁用，则返回true。否则返回false
      isBtnDisabled() {
        if (this.selectedCateKeys.length !== 3) {
          return true
        }
        return false
      },
      //当前选中的三级分类的id
      cateId() {
        if (this.selectedCateKeys.length === 3) {
          return this.selectedCateKeys[2]
        }
        return null
      },
      //动态计算标题的文本
      titleText() {
        if (this.activeName === 'many') {
          return '动态参数'
        }
        return '静态属性'
      }
    },

    created() {
      this.getCateList()
    },

    methods: {
      //级联选择器
      async getCateList() {
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.cataList = res.data
      },
      //控制只能选中三级
      handleChange() {
        this.getParamsData()
      },
      //获取参数列表的数据
      async getParamsData() {
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = []
          this.manyTableData = []
          this.onlyTabData = []
          return
        }
        //根据所选分类id，和当前所处面板，获取对应的参数
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
          { params: { sel: this.activeName } })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        //分割字符串成为数据，用来渲染展开项的Tag标签
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
          //为每一行Tag添加单独的数据绑定
          //控制文本框的显示与隐藏
          item.inputVisible = false
          //文本框输入的值
          item.inputValue = ''
        })
        //根据静态动态分别挂载属性数据
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTabData = res.data
        }
      },
      //Tap页签点击事件
      handleTapClick() {
        this.getParamsData()
      },

      //添加参数对话框的关闭事件
      addTextDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      //点击按钮，添加参数
      addParams() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success(res.meta.msg)
          this.addTextDialogVisible = false
          this.getParamsData()
        })
      },

      //点击按钮，展示修改对话框
      async showEditDialog(attr_id) {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,
          { params: { attr_sel: this.activeName } })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.editForm = res.data
        this.editTextDialogVisible = true
      },
      editTextDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      //点击按钮，修改参数信息
      editParams() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/
          ${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success(res.meta.msg)
          this.getParamsData()
          this.editTextDialogVisible = false
        })

      },

      //根据id删除对应参数项
      async removeParams(attr_id) {
        const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消')
        }
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getParamsData()
      },

      //在Tag标签，添加参数的介绍信息
      //文本框失去焦点或按下 enter 都会触发
      async handleInputConfirm(row) {
        if (row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        //后续处理
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        //发起请求，保存次操作
        this.saveAttrVals(row)
      },
      //对attr_vals的操作保存数据库
      async saveAttrVals(row) {
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
          {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(',')
          })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        return this.$message.success(res.meta.msg)
      },
      //点击按钮显示文本框
      showInput(row) {
        row.inputVisible = true
        //让文本框自动获得焦点
        //$nextTick:当页面上的元素被重新渲染之后，才会执行回调中的代码
        this.$nextTick(() => {
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
      //删除对应的Tag参数介绍
      handleClose(i, row) {
        row.attr_vals.splice(i, 1)
        this.saveAttrVals(row)
      }

    }
  }
</script>

<style lang="less" scoped>

  .el-row {
    margin: 15px 0;
  }

  .el-tag {
    margin: 5px 10px;
  }

  .input-new-tag {
    width: 120px;
  }
</style>