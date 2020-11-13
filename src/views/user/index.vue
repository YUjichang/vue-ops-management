<template>
  <div class="app-container">
    <!-- 工具栏  -->
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="用户名" prefix-icon="el-icon-search" style="width: 400px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 20px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加用户
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="ID" width="80" align="center">
        <template slot-scope="scope">
          {{ (listQuery.page - 1) * listQuery.limit + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="用户名" width="200" align="center">
        <template slot-scope="scope">
          {{ scope.row.users_username }}
        </template>
      </el-table-column>
      <el-table-column label="角色" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.users_role }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="250" align="center">
        <template slot-scope="scope">
          {{ scope.row.users_insert_time }}
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" />
      <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            重置密码
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <!-- 弹窗界面 -->
    <el-dialog title="添加用户" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户名" prop="users_username">
          <el-input v-model="temp.users_username" />
        </el-form-item>
        <el-form-item label="角色" prop="users_role">
          <el-select v-model="temp.users_role" class="filter-item" placeholder="Please select">
            <el-option v-for="item in roleOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="users_password">
          <el-input v-model="temp.users_password" :type="passwordType" />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createData">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="提示" :visible.sync="deleteVisible" width="30%">
      <span>确认删除？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="deleteData">
          确认
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getUsers, createUsers, deleteUsers, updateUsers } from '@/api/user'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'

export default {
  name: 'UserTable',
  components: { Pagination },
  directives: { waves },
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      list: null,
      total: 0,
      listQuery: {
        page: 1,
        limit: 20,
        username: undefined
      },
      temp: {
        users_id: undefined,
        users_username: undefined,
        users_role: undefined,
        users_insert_time: undefined,
        users_password: undefined
      },
      roleOptions: ['admin', 'user'],
      listLoading: true,
      dialogFormVisible: false,
      deleteVisible: false,
      passwordType: 'password',
      rules: {
        users_username: [{ required: true, message: 'user name is require', trigger: 'blur' }],
        users_role: [{ required: true, message: 'role is require', trigger: 'change' }],
        users_password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getUsers(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    resetTemp() {
      this.temp = {
        users_id: undefined,
        users_username: undefined,
        users_role: undefined,
        users_insert_time: undefined,
        users_password: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createUsers(this.temp).then(() => {
            this.fetchData()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '添加用户成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      updateUsers(this.temp.users_id).then(() => {
        this.fetchData()
        this.$notify({
          title: '成功',
          message: '重置密码成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleDelete(row) {
      this.temp = Object.assign({}, row)
      this.deleteVisible = true
    },
    deleteData() {
      const tempData = Object.assign({}, this.temp)
      deleteUsers(tempData.users_id).then(() => {
        this.deleteVisible = false
        this.$notify({
          title: '成功',
          message: '删除用户成功',
          type: 'success',
          duration: 2000
        })
        this.fetchData()
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
