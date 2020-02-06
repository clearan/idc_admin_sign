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
        <h4 class="login-title">
        </h4>

        <el-tabs v-model="activeName">
          <el-tab-pane label="用户密码" name="user">

            <el-form class="login-form" status-icon ref="loginForm" :model="loginForm" :rules="loginRules" label-width="0">

              <el-form-item prop="username">
                <el-input ref="username"  v-model="loginForm.username" size="small"  placeholder="请输入用户名" maxlength="16" autofocus>
                  <svg-icon slot="prefix" icon-class="user" style="margin-left: 5px"/>
                </el-input>
              </el-form-item>

              <el-form-item prop="password">
                <el-input ref="password" v-model="loginForm.password" :type="passwordType"  @keyup.enter.native="handleLogin" size="small" :key="passwordType"  auto-complete="off" placeholder="请输入密码" maxlength="16">
                  <i class="el-icon-view el-input__icon" slot="suffix" @click="showPassword"></i>
                  <svg-icon slot="prefix" icon-class="password" style="margin-left: 5px"/>
                </el-input>
              </el-form-item>

              <el-form-item prop="vcode">
                <el-input ref="vcode" v-model="loginForm.vcode"   @keyup.enter.native="handleLogin" size="small"   auto-complete="off" placeholder="请输入安全码" maxlength="6">
                  <svg-icon slot="prefix" icon-class="password" style="margin-left: 5px"/>
                </el-input>
              </el-form-item>

<!--              <el-checkbox v-model="checked">记住账号</el-checkbox>-->
<!--              <el-button type="text" size="mini" @click.native.prevent="pagetoInfo">忘记密码</el-button>-->
<!--              <el-button size="mini" style="float: right" type="text" @click.native.prevent="pagetoReg">注册</el-button>-->
              <el-form-item>
                <el-button type="primary" :loading="loading" size="small" @click.native.prevent="handleLogin" class="login-submit">登录</el-button>
              </el-form-item>


            </el-form>

          </el-tab-pane>
        </el-tabs>

      </div>
    </div>

  </div>
</template>
<script>
    import { validUsername ,validateVcode} from '@/utils/validate'
    import {LocalStorage} from '@/utils/storage'
    import qs from 'qs'
    import md5 from 'js-md5';
    //let Base64 = require('js-base64').Base64;
    export default {
        name: 'Login',
        data() {
            const validateUsername = (rule, value, callback) => {
                if (!validUsername(value)) {
                    callback(new Error('请输入正确的用户名'))
                } else {
                    let data = {user_name:this.loginForm.username};
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
                } else {
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
                loginForm: {
                    username: '',
                    password: '',
                    vcode:''
                },
                loginRules: {
                    username: [{ required: true, trigger: 'blur', validator: validateUsername }],
                    password: [{ required: true, trigger: 'blur', validator: validatePassword }],
                    vcode: [{ required: true, trigger: 'blur', validator: validateVerifycode }]
                },
                activeName: 'user',
                loading: false,
                //checked: false,
                passwordType: 'password',
                redirect: undefined,
                otherQuery: {}
            }
        },
        watch: {
            $route: {
                handler: function(route) {
                    // this.redirect = route.query && route.query.redirect
                    const query = route.query
                    if (query) {
                        this.redirect = query.redirect
                        this.otherQuery = this.getOtherQuery(query)
                    }
                },
                immediate: true
            }
        },
        methods: {
            showPassword() {
                this.passwordType === ''
                    ? (this.passwordType = 'password')
                    : (this.passwordType = '')
            },
            handleLogin() {
                var _this = this;
                _this.$refs.loginForm.validate(valid => {
                    if (valid) {
                        _this.loading = true
                        let data ={
                                user_name: _this.loginForm.username,
                                passwd:md5(_this.loginForm.password),
                                vcode:_this.loginForm.vcode,
                                idempotent:Date.now()
                            };

                        _this.$http.post('signin',qs.stringify(data)).then((resp)=>{
                            _this.loading = false;
                            if(resp.ret_code >= 0) {
                               // console.log(resp);return
                                let date = new Date().getTime();
                                LocalStorage.set("sess", resp.ret_data.sess, date + 3*60*60*1000);
                                LocalStorage.set("self_id", resp.ret_data.self_id, date + 3*60*60*1000);
                                LocalStorage.set("user_name", _this.loginForm.username, date + 3*60*60*1000);
                                LocalStorage.set("user_info", resp.ret_data.userinfo, date + 3*60*60*1000);

                                let prex = '',
                                _host =  `//${window.location.host}` === process.env.VUE_APP_PUSH_URL ? process.env.VUE_APP_PUSH_URL :process.env.VUE_APP_PUSH_URL2
                                if (this.redirect === undefined) {
                                    prex = _host+'/main'
                                } else {

                                    if (this.redirect === '/apply/index' || this.redirect === '/apply/success') {
                                        prex = _host+'/main'
                                    } else {
                                        if (Object.keys(this.otherQuery).length===0) {
                                            prex = _host+'/main#'+this.redirect
                                        }else{
                                            prex = _host+'/main#'+this.redirect+'&'+Object.keys(this.otherQuery)[0]+'='+Object.values(this.otherQuery)[0]
                                        }

                                    }
                                }

                                window.location.href=prex;

                            }else {
                                _this.$message({
                                    message:resp.ret_msg,
                                    type:'error',
                                    center:true
                                })
                            }
                        }).catch((err)=>{
                            _this.loading = false;
                            console.log(err)
                            _this.$message({
                                message:'系统繁忙，请稍后重试',
                                type:'error',
                                center:true
                            })
                        })
                    } else {
                        console.log('error submit!!')
                        return false
                    }
                })
            },
            getOtherQuery(query) {
                return Object.keys(query).reduce((acc, cur) => {
                    if (cur !== 'redirect') {
                        acc[cur] = query[cur]
                    }
                    return acc
                }, {})
            },
            pagetoReg() {
                this.$router.push('/reg');
            },

            pagetoInfo() {
                this.$router.push('/info');
            }
        },

        created() {
            console.log(window.location.host)
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
</style>
