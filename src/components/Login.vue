<template>
  <div class="login-container">
    <div class="login_box">
      <!--头像区域-->
      <div class="avatar_box">
        <img src="../assets/logo.jpg" alt="">
      </div>
      <!-- 表单区域-->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="70px"
               class="login_form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
        </el-form-item>
        <!--按钮-->
        <el-form-item class="btns">
          <el-button type="primary" round @click="login">登录</el-button>
          <el-button type="info" round @click="restloginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Login',
    data() {
      return {
        //这是登录表单的数据绑定对象
        loginForm: {
          username: 'admin',
          password: '123456'
        },
        //表单的验证规则对象
        loginFormRules: {
          username: [
            { required: true, message: '请输入登录名称', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入登录密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 115 个字符', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      restloginForm() {
        this.$refs.loginFormRef.resetFields()
      },
      login() {
        this.$refs.loginFormRef.validate(async valid => {
          if (!valid) return
          //对象解构
          const { data: res } = await this.$http.post('login', this.loginForm)
          if (res.meta.status !== 200) {
            return this.$message.error('登录失败')
          } else {
            this.$message.success('登录成功')
          }
          //将token保存在客户端的sessionStorage中
          window.sessionStorage.setItem('token', res.data.token)
          //跳转到home
          this.$router.push('/home')

        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .login-container {
    background-image: url("../assets/login.jpg");
    height: 100%;
  }

  .login_box {
    width: 450px;
    height: 300px;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: rgba(246, 246, 246, 0.6);

    .avatar_box {
      /*opacity:1;*/
      height: 130px;
      width: 130px;
      border: 1px solid #eeeeee;
      border-radius: 50%;
      padding: 5px;
      box-shadow: 0 0 5px;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);


      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;

  }

  .btns {
    display: flex;
    justify-content: flex-end;
  }
</style>