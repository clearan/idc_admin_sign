<template>

  <div class="login-container pull-height" @keyup.enter.native="handleLogin">
    <div class="login-info text-white animated fadeInLeft">
      <div class="logo" style="margin-top:-426px">
        <img src="../../assets/images/home/logo.png" width="160px" height="160px" alt="logo" style="vertical-align: middle;" />
      </div>
<!--      <h2 class="login-info-title">{{111}}</h2>-->
      <ul class="login-info-list">
<!--        <li class="login-info-item" v-for="item in website.info.list">-->
<!--          <i class="el-icon-check"></i>&nbsp;{{item}}-->
<!--        </li>-->
      </ul>
    </div>
    <div class="login-border  animated fadeInRight">
      <div class="login-main">
        <div>
          <h4 class="login-title">
            <el-button round >修改密码</el-button>
          </h4>

          <el-tabs v-model="activeName" >
            <el-form class="login-form" status-icon ref="infoForm" :model="infoForm" :rules="loginRules" label-width="0">

              <el-form-item prop="username">
                <el-input ref="username"  v-model="infoForm.username" size="small"  placeholder="请输入用户名" maxlength="16" autofocus>
                  <svg-icon slot="prefix" icon-class="user" style="margin-left: 5px"/>
                </el-input>
              </el-form-item>

              <el-form-item prop="password">
                <el-input ref="password" v-model="infoForm.password" :type="passwordType" :key="passwordType" size="small"  auto-complete="off" placeholder="设置密码" maxlength="16">
                  <svg-icon slot="prefix" icon-class="password" style="margin-left: 5px"/>
                </el-input>
              </el-form-item>

              <el-form-item prop="vcode">
                <el-input ref="vcode" v-model="infoForm.vcode"   @keyup.enter.native="handleLogin" size="small"   auto-complete="off" placeholder="请输入安全码" maxlength="6">
                  <svg-icon slot="prefix" icon-class="password" style="margin-left: 5px"/>
                </el-input>
              </el-form-item>


              <el-form-item align="center">
                <el-button type="default" size="small" @click.native.prevent="pagetoLogin">返回</el-button>
                <el-button type="primary" size="small" :loading="loading"  @click.native.prevent="handleLogin">确认</el-button>
              </el-form-item>

            </el-form>
          </el-tabs>
        </div>


      </div>
    </div>

  </div>
</template>

<script>
    import { validateVcode,validUsername} from '@/utils/validate'
    import qs from 'qs'
    import md5 from 'js-md5';

    let Base64 = require('js-base64').Base64;
    export default {
        name: 'Reg',
        data() {

            const validateUsername = (rule, value, callback) => {
                if (!validUsername(value)) {
                    callback(new Error('请输入正确的用户名'))
                } else {
                    let data = {user_name:this.infoForm.username};
                    this.$http.post('check_username',qs.stringify(data)).then((resp)=>{
                        if(resp.ret_code <= 0) {
                            callback(new Error('该用户名不存在'))
                        }else {
                            callback()
                        }
                    }).catch((err)=>{
                        console.log(err)
                        callback(new Error('请输入正确的用户名'))
                    })
                }
            }

            const validatePassword = (rule, value, callback) => {
                if (value.length < 6) {
                    callback(new Error('密码长度最少为6位'))
                }else{
                    callback()
                }
            }

            const validateVerifycode = (rule, value, callback) => {
                if (!validateVcode(value)) {
                    callback(new Error('安全码长度最少为6位'))
                } else {
                    callback()
                }
            }

            return {
                infoForm: {
                    username:'',
                    password: '',
                    vcode: ''
                },
                loginRules: {
                    username: [{ required: true, trigger: 'blur', validator: validateUsername }],
                    password: [{ required: true, trigger: 'blur', validator: validatePassword }],
                    vcode: [{ required: true, trigger: 'blur', validator: validateVerifycode }]
                },
                activeName: 'user',
                loading: false,
                checked: false,
                passwordType: 'password',
            }
        },
        methods: {

            handleLogin() {
                var _this = this;
                _this.$refs.infoForm.validate(valid => {
                    if (valid) {
                        _this.loading = true
                        let data = {
                                user_name: _this.infoForm.username,
                                passwd: md5(_this.infoForm.password),
                                vcode:_this.infoForm.vcode,
                                idempotent: Date.now(),
                            }
                        _this.$http.post('change_passwd',qs.stringify(data)).then((resp) => {
                            _this.loading = false
                            if(resp.ret_code === 0) {
                                _this.$message({
                                    message:'修改成功',
                                    type:'success',
                                    center:true
                                },setTimeout(()=>{
                                    this.$router.push('/login');
                                },2000))
                            }else {
                                _this.$message({
                                    message:resp.ret_msg,
                                    type:'error',
                                    center:true
                                })
                            }
                        }).catch((err)=>{
                            _this.loading = false
                            console.log(err)
                        })

                    } else {
                        console.log('error submit!!')
                        return false
                    }
                })
            },

            pagetoLogin() {
                this.$router.push('/login');
            }
        }
    }
</script>

<style lang="scss">
  .el-form-item__error {
    color: #f56c6c;
    font-size: 12px;
    line-height: 1;
    padding-top: 0;
    position: absolute;
    top: 100%;
    left: 0;
  }
  .login-container {
    display: flex;
    align-items: center;
    justify-content: space-around;
    background: rgba(0, 0, 0, 0.2);
    position: relative;
    height: 900px;
  }
  .login-container::before {
    z-index: -999;
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: url("../../assets/images/top_images/login.png");
    background-size: cover;
  }
  .login-info {
    padding-left: 60px;
  }
  .login-info-title {
    line-height: 90px;
  }
  .login-info-item {
    font-size: 14px;
  }
  .login-border {
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding: 30px 50px 25px 50px;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 1px 1px 2px #eee;
  }
  .login-main {
    border-radius: 3px;
    box-sizing: border-box;
    background-color: #fff;
  }
  .login-main > h3 {
    margin-bottom: 20px;
  }
  .login-main > p {
    color: #76838f;
  }
  .login-title {
    margin: 0 0 20px;
    text-align: center;
    color: #409eff;
    letter-spacing: 3px;
  }
  .login-submit {
    margin-top: 20px;
    width: 100%;
    border-radius: 28px;
  }
  .login-form {
    margin: 10px 0;
    .el-form-item__content {
      width: 270px;
    }
    .el-form-item {
      margin-bottom: 12px;
    }
    .el-input {
      input {
        text-indent: 5px;
        border-color: #dcdcdc;
        border-radius: 3px;
      }
      .el-input__prefix {
        i {
          padding: 0 5px;
          font-size: 16px !important;
        }
      }
    }
  }
  .login-code {
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin: 0 0 0 10px;
  }
  .login-code-img {
    margin-top: 2px;
    width: 100px;
    height: 32px;
    background-color: #fdfdfd;
    border: 1px solid #f0f0f0;
    color: #333;
    font-size: 14px;
    font-weight: bold;
    letter-spacing: 5px;
    line-height: 32px;
    text-indent: 5px;
    text-align: center;
  }

</style>
