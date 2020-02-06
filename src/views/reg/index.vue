<template>

  <div class="login-container pull-height" @keyup.enter.native="handleLogin">
    <div class="login-info text-white animated fadeInLeft">
      <div class="logo" style="margin-top:-426px">
        <img src="../../assets/images/home/logo.png" width="160px" height="160px" alt="logo" style="vertical-align: middle;" />
      </div>
      <h2 class="login-info-title"></h2>
      <ul class="login-info-list">
<!--        <li class="login-info-item" v-for="item in website.info.list">-->
<!--          <i class="el-icon-check"></i>&nbsp;{{item}}-->
<!--        </li>-->
      </ul>
    </div>
    <div class="login-border  animated fadeInRight">
      <div class="login-main">
        <el-tabs v-show="qr_res">
          <canvas id="canvas" style="margin: 0 0 0 10px;"></canvas>
          <el-alert
            title="请用谷歌验证器扫描二维码"
            type="error"
            :closable="false">
          </el-alert>
          <el-button round @click.native.prevent="pagetoLogin" type="primary" class="login-submit">完成</el-button>

        </el-tabs>
        <div v-show="!qr_res">
          <h4 class="login-title">
            <el-button round @click.native.prevent="pagetoLogin">返回首页</el-button>
          </h4>

          <el-tabs v-model="activeName" >
            <el-form class="login-form" status-icon ref="loginForm" :model="loginForm" :rules="loginRules" label-width="0">

              <el-form-item prop="username">
                <el-input ref="username"  v-model="loginForm.username" size="small" autofocus placeholder="账户名" maxlength="16" @keyup.enter.native="handleLogin">
                </el-input>
              </el-form-item>

              <el-form-item prop="password">
                <el-input ref="password" v-model="loginForm.password" :type="passwordType"   size="small" :key="passwordType"  auto-complete="off" placeholder="设置密码" maxlength="16" @keyup.enter.native="handleLogin">
                </el-input>
              </el-form-item>

              <el-form-item prop="password2">
                <el-input ref="password2" v-model="loginForm.password2" :type="passwordType"  @keyup.enter.native="handleLogin" size="small" :key="passwordType"  auto-complete="off" placeholder="确认密码" maxlength="16">
                </el-input>
              </el-form-item>


              <el-form-item>
                <el-button type="primary" :loading="loading" size="small" @click.native.prevent="handleLogin" class="login-submit">注册</el-button>
              </el-form-item>



            </el-form>


          </el-tabs></div>


      </div>
    </div>

  </div>
</template>

<script>
    import { validUsername } from '@/utils/validate'
    //import axios from 'axios'
    import qs from 'qs'
    import md5 from 'js-md5';
    import QRCode from 'qrcode'

    export default {
        name: 'Reg',
        data() {

            const validateUsername = (rule, value, callback) => {
                if (!validUsername(value)) {
                    callback(new Error('请输入正确的用户名'))
                } else {
                    let data = {user_name:this.loginForm.username};
                    this.$http.post('check_username',qs.stringify(data)).then((resp)=>{
                        if(resp.ret_code === 0) {
                            callback()
                        }else if(resp.ret_code >0 ) {
                            callback(new Error('用户名已存在'))
                        }else{
                            callback(new Error('请重新填写'))
                        }
                    }).catch((err)=>{
                        console.log(err)
                        callback(new Error('网络错误'))
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
            const validatePassword2 = (rule, value, callback) => {
                if (value.length < 6) {
                    callback(new Error('密码长度最少为6位'))
                } else if(value!==this.loginForm.password){
                    callback(new Error('两次密码输入不一致'))
                } else{
                    callback()
                }
            }
            return {
                loginForm: {
                    username: '',
                    password: '',
                    password2:''
                },
                loginRules: {
                    username: [{ required: true, trigger: 'blur', validator: validateUsername }],
                    password: [{ required: true, trigger: 'blur', validator: validatePassword }],
                    password2: [{ required: true, trigger: 'blur', validator: validatePassword2 }]
                },
                activeName: 'user',
                loading: false,
                checked: false,
                passwordType: 'password',
                redirect: undefined,
                qr_res:false
            }
        },
        watch: {
            $route: {
                handler: function(route) {
                    this.redirect = route.query && route.query.redirect
                },
                immediate: true
            }
        },
        methods: {

            handleLogin() {
                var _this = this;
                _this.$refs.loginForm.validate(valid => {
                    if (valid) {
                        _this.loading = true
                        let data = {
                                user_name: this.loginForm.username,
                                passwd: md5(this.loginForm.password)
                            }
                        _this.$http.post('signup',qs.stringify(data)).then((resp) => {
                            _this.loading = false
                            if (resp.ret_code > 0) {
                                let qr_url = resp.ret_data.url,
                                    canvas = document.getElementById('canvas')
                                QRCode.toCanvas (canvas, qr_url, function (error) {
                                    if(error) {
                                        console.log(error);
                                        _this.qr_res = false
                                        _this.$message({
                                            message:'谷歌二维码生成失败',
                                            type: 'error',
                                            center: true
                                        })
                                        return
                                    }
                                    _this.qr_res = true
                                    console.log('QRCode success!');
                                })
                            } else {
                                _this.$message ({
                                    message: resp.ret_msg,
                                    type: 'error',
                                    center: true
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

  .el-form-item__error {
    color: #f56c6c;
    font-size: 12px;
    line-height: 1;
    padding-top: 0;
    position: absolute;
    top: 100%;
    left: 0;
  }
</style>
