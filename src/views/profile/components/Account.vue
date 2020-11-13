<template>
  <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
    <el-form-item label="原密码" prop="oldPassword">
      <el-input v-model="temp.oldPassword" :type="passwordType" placeholder="请输入原密码" />
      <span class="show-pwd" @click="showPwd">
        <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
      </span>
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="temp.newPassword" :type="passwordType" placeholder="请输入新密码" />
      <span class="show-pwd" @click="showPwd">
        <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
      </span>
    </el-form-item>
    <el-form-item label="确认密码" prop="newPassword2">
      <el-input v-model="temp.newPassword2" :type="passwordType" placeholder="请确认新密码" />
      <span class="show-pwd" @click="showPwd">
        <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
      </span>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">保存设置</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updatePassword } from '@/api/user'
export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          avatar: ''
        }
      }
    }
  },
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    const validateNewPassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else if (value === this.temp.oldPassword) {
        callback(new Error('新密码不能与原密码相同!'))
      } else {
        callback()
      }
    }
    const validateNewPassword2 = (rule, value, callback) => {
      if (value !== this.temp.newPassword) {
        callback(new Error('与新密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      temp: {
        username: this.user.name,
        oldPassword: '',
        newPassword: '',
        newPassword2: ''
      },
      passwordType: 'password',
      rules: {
        oldPassword: [{ required: true, trigger: 'blur', validator: validatePassword }],
        newPassword: [{ required: true, trigger: 'blur', validator: validateNewPassword }],
        newPassword2: [{ required: true, trigger: 'blur', validator: validateNewPassword2 }]
      }
    }
  },
  methods: {
    submit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          console.log(this.temp.username)
          updatePassword(this.temp).then(() => {
            this.$message({
              message: '密码修改成功',
              type: 'success',
              duration: 5 * 1000
            })
            this.$store.dispatch('user/logout')
            this.$router.push(`/login?redirect=${this.$route.fullPath}`)
          })
        } else {
          this.$message.error('请正确填写表单')
          return false
        }
      })
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$dark_gray:#889aa4;
.show-pwd {
  position: absolute;
  right: 10px;
  top: 1px;
  font-size: 16px;
  color: $dark_gray;
  cursor: pointer;
  user-select: none;
}
</style>
