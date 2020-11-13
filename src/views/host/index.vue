<template>
  <div class="app-container">
    <!-- 工具栏  -->
    <div class="filter-container">
      <label class="radio-label" style="padding-left:0;">主机分组： </label>
      <el-select v-model="listQuery.group" placeholder="请选择" clearable style="width: 200px" class="filter-item">
        <el-option v-for="item in groupOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <label class="radio-label" style="padding-left:0;margin-left: 20px;">主机名： </label>
      <el-input v-model="listQuery.hostname" placeholder="请输入" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <label class="radio-label" style="padding-left:0;margin-left: 20px;">连接地址： </label>
      <el-input v-model="listQuery.ipaddress" placeholder="请输入" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 20px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-upload2" @click="handleUpload">
        批量导入
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
      <el-table-column label="分组" align="center">
        <template slot-scope="scope">
          {{ scope.row.hosts_group }}
        </template>
      </el-table-column>
      <el-table-column label="主机名称" width="200" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.hosts_hostname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="连接地址" width="200" align="center">
        <template slot-scope="scope">
          {{ scope.row.hosts_ipaddress }}
        </template>
      </el-table-column>
      <el-table-column label="端口" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.hosts_port }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.hosts_username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="连接类型" width="120" align="center">
        <template slot-scope="scope">
          {{ scope.row.hosts_type }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
          <el-button size="mini" type="primary" @click="handleConsole(row)">
            Console
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <!-- 弹窗界面 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="主机分组" prop="hosts_group">
          <el-select v-model="temp.hosts_group" class="filter-item" placeholder="Please select">
            <el-option v-for="item in groupOptions" :key="item" :label="item" :value="item" />
          </el-select>
          <el-button class="filter-item" style="margin-left: 20px;" type="text" @click="handleCreateGroup">
            添加分组
          </el-button>
        </el-form-item>
        <el-form-item label="主机名称" prop="hosts_hostname">
          <el-input v-model="temp.hosts_hostname" />
        </el-form-item>
        <el-form-item label="连接地址" prop="hosts_ipaddress">
          <el-input v-model="temp.hosts_ipaddress" />
        </el-form-item>
        <el-form-item label="端口" prop="hosts_port">
          <el-input v-model="temp.hosts_port" />
        </el-form-item>
        <el-form-item label="用户名" prop="hosts_username">
          <el-input v-model="temp.hosts_username" />
        </el-form-item>
        <el-form-item label="密码" prop="hosts_password">
          <el-input v-model="temp.hosts_password" type="password" />
        </el-form-item>
        <el-form-item label="连接类型" prop="hosts_type">
          <el-select v-model="temp.hosts_type" class="filter-item" placeholder="Please select">
            <el-option v-for="item in typeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="添加主机分组" :visible.sync="groupFormVisible" width="30%">
      <el-form ref="groupForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 300px; margin-left:50px;">
        <el-form-item label="主机分组" prop="hosts_group">
          <el-input v-model="temp.hosts_group" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="groupFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createGroup">
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
import { getHosts, createHosts, updateHosts, deleteHosts } from '@/api/hosts/table'
import { getGroups, createGroups } from '@/api/groups/group'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'

export default {
  name: 'HostTable',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: null,
      total: 0,
      groupOptions: [],
      typeOptions: ['ssh', 'vnc'],
      listQuery: {
        page: 1,
        limit: 20,
        hostname: undefined,
        ipaddress: undefined,
        group: undefined
      },
      temp: {
        hosts_id: undefined,
        hosts_hostname: undefined,
        hosts_group: undefined,
        hosts_ipaddress: undefined,
        hosts_port: 22,
        hosts_username: 'root',
        hosts_password: undefined,
        hosts_type: undefined
      },
      listLoading: true,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogFormVisible: false,
      groupFormVisible: false,
      deleteVisible: false,
      rules: {
        hosts_group: [{ required: true, message: 'host group is required', trigger: 'change' }],
        hosts_hostname: [{ required: true, message: 'host name is required', trigger: 'blur' }],
        hosts_ipaddress: [{ required: true, message: 'host ip  is required', trigger: 'blur' }],
        hosts_port: [{ required: true, message: 'connect port is required', trigger: 'blur' }],
        hosts_username: [{ required: false, message: 'if use ssh type,require username, else use vnc type,username not require', trigger: 'blur' }],
        hosts_password: [{ required: true, message: 'connect password is required', trigger: 'blur' }],
        hosts_type: [{ required: true, message: 'connect type is required', trigger: 'change' }]
      }
    }
  },
  created() {
    this.fetchData()
    this.handleFetchGroup()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getHosts(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total
        this.listLoading = false
      })
    },
    handleConsole(row) {
      this.temp = Object.assign({}, row)
      if (this.temp.hosts_type === 'ssh') {
        this.handleWebssh()
      } else {
        this.handleNoVnc()
      }
    },
    handleWebssh() {
      const { href } = this.$router.resolve({
        path: '/webssh',
        query: {
          name: this.temp.hosts_hostname
        }
      })
      window.open(href, '_blank')
    },
    handleNoVnc() {
      const { href } = this.$router.resolve({
        path: '/novnc',
        query: {
          name: this.temp.hosts_hostname
        }
      })
      window.open(href, '_blank')
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    resetTemp() {
      this.temp = {
        hosts_id: undefined,
        hosts_hostname: undefined,
        hosts_group: undefined,
        hosts_ipaddress: undefined,
        hosts_port: 22,
        hosts_username: 'root',
        hosts_password: undefined,
        hosts_type: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createHosts(this.temp).then(() => {
            this.fetchData()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateHosts(tempData.hosts_id, tempData).then(() => {
            this.fetchData()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.temp = Object.assign({}, row)
      this.deleteVisible = true
    },
    deleteData() {
      const tempData = Object.assign({}, this.temp)
      deleteHosts(tempData.hosts_id).then(() => {
        this.deleteVisible = false
        this.$notify({
          title: '成功',
          message: '删除主机成功',
          type: 'success',
          duration: 2000
        })
        this.fetchData()
      })
    },
    handleUpload() {
      this.$router.push('/host/import')
    },
    handleFetchGroup() {
      this.groupOptions = []
      getGroups().then(response => {
        response.data.forEach(item => {
          this.groupOptions.push(item.groups_name)
        })
      })
    },
    handleCreateGroup() {
      this.temp.hosts_group = ''
      this.groupFormVisible = true
      this.$nextTick(() => {
        this.$refs['groupForm'].clearValidate()
      })
    },
    createGroup() {
      this.$refs['groupForm'].validate((valid) => {
        const groupTemp = { 'groups_name': this.temp.hosts_group }
        if (valid) {
          createGroups(groupTemp).then(() => {
            this.handleFetchGroup()
            this.groupFormVisible = false
            this.$notify({
              title: '成功',
              message: '添加主机分组成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    }
  }
}
</script>
