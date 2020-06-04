<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区-->
    <el-card>

      <!--搜索与添加区域-->
      <el-row :gutter="25">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="clearGetUserList">
            <el-button slot="append" icon="el-icon-search" @click="searchGetUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" round @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!--用户列表区-->
      <el-table :data="userlist" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>

        <el-table-column label="状态">
          //通过作用域插槽来自定义格式
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#ff4949"
                       @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="small"
                       @click="showModifyDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="small"
                       @click="removeUserById(scope.row.id, scope.row.username)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="small" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>

    <!--添加用户对话框-->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!--内容主体区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改用户的对话框-->
    <el-dialog title="修改用户" :visible.sync="modifyDialogVisible" width="30%" @close="modifyDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
                <el-button @click="modifyDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="modifyUserInfo">确 定</el-button>
            </span>
    </el-dialog>

    <!--分配角色的对话框-->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="30%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolelist" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
  export default {
    name: 'Users',

    data() {
      //验证密码的校验规则
      let checkPassword = (rule, value, callback) => {
        const regEmail = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
        if (regEmail.test(value)) {
          return callback()
        }
        callback(new Error('至少8个字符，至少1个大写字母，1个小写字母和1个数字,不能包含特殊字符（非数字字母）'))
      }
      //验证邮箱的校验规则
      let checkEmail = (rule, value, callback) => {
        const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
        if (regEmail.test(value)) {
          return callback()
        }
        callback(new Error('请输入合法邮箱'))
      }
      //验证手机号的校验规则
      let checkMobile = (rule, value, callback) => {
        const regEmail = /^1[0-9]{10}$/
        if (regEmail.test(value)) {
          return callback()
        }
        callback(new Error('请输入合法手机号'))
      }

      return {
        //获取用户列表的参数对象
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 2
        },
        //f分页
        userlist: [],
        total: 0,
        //控制添加用户对话框的显示和隐藏
        addDialogVisible: false,
        //添加用的户表单对象
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        //添加表单的验证规则对象
        addFormRules: {
          username: [
            { required: true, message: '请输入用户名称', trigger: 'blur' },
            { min: 3, max: 10, message: '用户名称长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入用户密码', trigger: 'blur' },
            { validator: checkPassword, trigger: ['blur', 'change'] }
          ],
          email: [
            { required: true, message: '请输入邮箱地址', trigger: 'blur' },
            { validator: checkEmail, trigger: ['blur', 'change'] }
          ],
          mobile: [
            { required: true, message: '请输入电话', trigger: 'blur' },
            { validator: checkMobile, trigger: ['blur', 'change'] }
          ]
        },

        //控制修改用户对话框的显示和隐藏
        modifyDialogVisible: false,
        //查询到的用户信息对象
        editForm: {},
        //修改表单的验证规则对象
        editFormRules: {
          email: [
            { required: true, message: '请输入邮箱地址', trigger: 'blur' },
            { validator: checkEmail, trigger: ['blur', 'change'] }
          ],
          mobile: [
            { required: true, message: '请输入电话', trigger: 'blur' },
            { validator: checkMobile, trigger: ['blur', 'change'] }
          ]
        },

        //控制分配角色对话框的显示和隐藏
        setRoleDialogVisible: false,
        //需要被分配角色的用户信息
        userInfo: {},
        //所有角色的数据列表
        rolelist: [],
        //已经选中的角色id值
        selectedRoleId: ''
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        const { data: res } = await this.$http.get('users', { params: this.queryInfo })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.userlist = res.data.users
        this.total = res.data.total
        console.log(res)
      },
      //监听pagesize改变事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      //监听页码值改变事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },

      //监听switch开关状态的改变
      async userStateChange(userinfo) {
        console.log(userinfo)
        const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.me_state}`)
        if (res.meta.status !== 200) {
          userinfo.me_state = !userinfo.me_state
          return this.$message.error('更新用户状态失败')
        }
        this.$message.success(res.meta.msg)
      },

      //搜索框搜索事件
      searchGetUserList() {
        this.queryInfo.pagenum = 1
        this.getUserList()
      },
      //搜索框清除事件
      clearGetUserList() {
        this.searchGetUserList()
      },

      //监听添加用户对话框关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      //点击按钮，添加新用户
      addUser() {
        this.$refs.addFormRef.validate(async (valid) => {
          if (!valid) return
          //可以发起添加用户的网络请求
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status != 201) {
            this.$message.error('添加用户失败')
          } else {
            this.$message.success('添加用户成功')
            this.addDialogVisible = false
            this.getUserList()
          }
        })
      },

      //展示编辑用户的对话框
      async showModifyDialog(id) {
        const { data: res } = await this.$http.get('users/' + id)
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
      //修改用户信息并替交
      modifyUserInfo() {
        this.$refs.editFormRef.validate(async (valid) => {
          if (!valid) return
          //可以发起添加用户的网络请求
          const { data: res } = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          if (res.meta.status != 200) {
            this.$message.error('更新用户失败')
          } else {
            this.$message.success('更新用户成功')
            this.modifyDialogVisible = false
            this.getUserList()
          }
        })
      },
      //根据id删除对应的用户信息
      async removeUserById(id, name) {
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
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        }
        this.$message.success('删除用户成功')
        this.queryInfo.pagenum = 1
        this.getUserList()

      },

      //展示分配决定的对话框
      async setRole(userInfo) {
        this.userInfo = userInfo
        //在展示对话框之前，获取所有角色的列表
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.rolelist = res.data

        this.setRoleDialogVisible = true
      },
      //点击按钮，分配角色
      async saveRoleInfo() {
        if (!this.selectedRoleId) {
          return this.$message.error('请选择要分配的角色')
        }
        const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$notify({
          title: '成功',
          message: res.meta.msg,
          type: 'success',
          duration: 1000
        })
        this.getUserList()
        this.setRoleDialogVisible = false
      },
      //监听分配角色对话框的关闭事件
      setRoleDialogClosed() {
        this.selectedRoleId = ''
        this.userInfo = {}
      }


    }
  }

</script>

<style scoped>

</style>