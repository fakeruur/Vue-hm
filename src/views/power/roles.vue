<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图-->
    <el-card>
      <!--添加角色按钮-->
      <el-row>
        <el-col>
          <el-button type="primary" round @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>

      <!--角色列表-->
      <el-table :data="rolelist" border stripe> //隔行变色

        <!--展开列,权限数据的渲染-->
        <el-table-column label="权限" type="expand">
          <template slot-scope="scope">
            <el-row :class="{bdbottom:true,bdtop:i1==0,vcenter:true}" v-for="(item1,i1) in scope.row.children"
                    :key="item1.id">
              <!--一级权限-->
              <el-col :span="6">
                <el-tag effect="dark" closable @close="removeRightById(scope.row,item1)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--二级和三级权限-->
              <el-col :span="18">
                <!--通过for循环嵌套渲染二级权限-->
                <el-row :class="{bdtop:i2 !== 0,vcenter:true}" v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag effect="dark" type="success" closable @close="removeRightById(scope.row,item2)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="(item3) in item2.children" :key="item3.id" effect="dark" type="warning" closable
                            @close="removeRightById(scope.row,item3)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <!--索引列-->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>

        <!--操作按钮-->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @click="showModifyDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="removeRoleById(scope.row.id, scope.row.roleName)">
              删除
            </el-button>
            <el-button type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>

      </el-table>

    </el-card>

    <!--添加用户对话框-->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed">
      <!--内容主体区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!--编辑角色对话框-->
    <el-dialog title="修改用户" :visible.sync="modifyDialogVisible" width="30%" @close="modifyDialogClosed">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
                <el-button @click="modifyDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="modifyUserInfo">确 定</el-button>
            </span>
    </el-dialog>

    <!--分配权限的对话框-->
    <el-dialog title="提示" :visible.sync="setRightDialogVisible" width="50%">
      <!--树形空间-->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all
               :default-checked-keys="defaultKeys" ref="treeRef"></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: 'Roles',
    data() {
      return {
        //角色列表数据
        rolelist: [],

        //控制添加用户对话框的显示和隐藏
        addDialogVisible: false,
        addForm: {
          roleName: '',
          roleDesc: ''
        },
        //添加角色表单的验证规则对象
        //编辑角色的验证规则
        addFormRules: {
          roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' },
            { min: 3, max: 10, message: '角色名称长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          roleDesc: [
            { required: true, message: '请输入角色描述', trigger: 'blur' },
            { min: 3, max: 10, message: '角色描述长度在 3 到 10 个字符', trigger: 'blur' }
          ]
        },

        //编辑角色对话框的显示和隐藏
        modifyDialogVisible: false,
        //编辑时查询到的用户信息对象
        editForm: {},

        //分配权限的对话框显示和隐藏
        setRightDialogVisible: false,
        //保存获取到的所有权限数据
        rightsList: [],
        //树形控件的属性绑定对象
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        //默认选中的节点id值数组
        defaultKeys: [],
        //当前即将分配权限的角色id
        roleId: ''
      }
    },

    created() {
      this.getRoleList()
    },

    methods: {
      //获取所有角色列表
      async getRoleList() {
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败')
        }
        this.rolelist = res.data
      },

      //监听添加角色对话框关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      //点击按钮，添加新角色
      addUser() {
        this.$refs.addFormRef.validate(async (valid) => {
          if (!valid) return
          //可以发起添加用户的网络请求
          const { data: res } = await this.$http.post('roles', this.addForm)
          if (res.meta.status != 201) {
            this.$message.error('添加用户失败')
          } else {
            this.$message.success('添加用户成功')
            this.addDialogVisible = false
            this.getRoleList()
          }
        })
      },

      //展示编辑用户的对话框
      async showModifyDialog(id) {
        const { data: res } = await this.$http.get('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('查询用户失败')
        }
        this.editForm = res.data
        this.modifyDialogVisible = true
      },
      //监听修改用户对话框关闭事件
      modifyDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      //修改角色信息并替交
      modifyUserInfo() {
        this.$refs.editFormRef.validate(async (valid) => {
          if (!valid) return
          //可以发起添加用户的网络请求
          const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          })
          if (res.meta.status != 200) {
            this.$message.error('更新用户失败')
          } else {
            this.$message.success('更新用户成功')
            this.modifyDialogVisible = false
            this.getRoleList()
          }
        })
      },

      //根据id删除对应角色户信息
      async removeRoleById(id, name) {
        //弹框询问用户是否删除数据
        //反引号，字符串中嵌入变量，需要将变量名写在${}之中
        const confimResult = await this.$confirm(`此操作将永久删除用户 ${name} , 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        //用户确认删除，返回字符串confirm
        //取消删除，返回字符串cancel
        if (confimResult == 'cancel') {
          return this.$message.info('已取消删除')
        }
        //发起请求删除
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        }
        this.$message.success('删除用户成功')
        this.getRoleList()

      },

      //点击Tag删除对应id权限
      async removeRightById(role, right) {
        const confimResult = await this.$confirm(`此操作将删除权限 ${right.authName} , 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confimResult == 'cancel') {
          return this.$message.info('已取消删除')
        }
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${right.id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败！')
        }
        role.children = res.data
      },

      //展示分配权限的对话框---------------难点
      async showSetRightDialog(role) {
        this.roleId = role.id
        //获取角色所有权限的数据
        const { data: res } = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.rightsList = res.data
        //每次打开对话框，初始化
        this.defaultKeys = []
        //递归获取三级节点
        this.getLeatKeys(role, this.defaultKeys)
        this.setRightDialogVisible = true
        console.log(this.defaultKeys)
      },
      //通过递归的形式，获取角色下所有的三级权限id，并保存到defaultKeys数组中
      getLeatKeys(node, arr) {
        //如果当前node节点不包含children属性，则为三级节点
        if (!node.children) {
          return arr.push(node.id)
        }
        //递归
        node.children.forEach(item => this.getLeatKeys(item, arr))
      },
      //为角色分配权限
      async allotRights() {
        const keys = [
          //展开运算符ES6语法
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        //拼接字符串
        const idStr = keys.join(',')
        const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getRoleList()
        this.setRightDialogVisible = false
      }

    }
  }
</script>


<style scoped>

  .el-tag {
    margin: 12px;
  }

  .bdtop {
    border-top: 1px solid #eeeeee;
  }

  .bdbottom {
    border-top: 1px solid #eeeeee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>