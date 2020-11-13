<template>
  <div class="app-container">
    <!-- 工具栏  -->
    <div class="filter-container">
      <label class="radio-label" style="padding-left:0;">监控内容： </label>
      <el-input v-model="listQuery.target" placeholder="请输入" style="width: 400px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <label class="radio-label" style="padding-left:0;margin-left: 20px;">状态： </label>
      <el-select v-model="listQuery.status" placeholder="请选择" clearable style="width: 100px" class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" style="margin-left: 20px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-refresh" @click="handleCheckNode">
        检查状态
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
      <el-table-column label="监控名称" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.monitors_name }}
        </template>
      </el-table-column>
      <el-table-column label="类型" width="80" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.monitors_type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="监控内容" align="center">
        <template slot-scope="scope">
          {{ scope.row.monitors_target }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.monitors_status == '1'" style="margin-right: 5px;">
            <svg-icon icon-class="normal" class="meta-item__icon" />
          </span>
          <span v-else style="margin-right: 5px;">
            <svg-icon icon-class="error" class="meta-item__icon" />
          </span>
          <span>{{ scope.row.monitors_status | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="200" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.monitors_insert_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建者" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.monitors_username }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" type="danger" :disabled="getDeleteRole(row)?false:true" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <!-- 弹窗界面 -->
    <el-dialog title="添加监控" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="监控名称" prop="monitors_name">
          <el-input v-model="temp.monitors_name" />
        </el-form-item>
        <el-form-item label="监控主机" prop="monitors_target">
          <el-select v-model="temp.monitors_target" class="filter-item" placeholder="Please select" filterable>
            <el-option v-for="item in hostsOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="监控类型" prop="monitors_type">
          <el-select v-model="temp.monitors_type" class="filter-item" placeholder="Please select">
            <el-option v-for="item in typeOptions" :key="item" :label="item" :value="item" />
          </el-select>
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
import { getHosts } from '@/api/hosts/table'
import { getMonitors, createMonitors, deleteMonitors, getNodeStatus } from '@/api/monitors/table'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'

// 字典
const statusOptions = [
  { key: '0', display_name: '异常' },
  { key: '1', display_name: '正常' },
  { key: '2', display_name: '未找到' }
]

const statusKeyValue = statusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'MonitorsTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      return statusKeyValue[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      statusOptions,
      typeOptions: ['system', 'service'],
      hostsOptions: [],
      listQuery: {
        page: 1,
        limit: 20,
        target: undefined,
        status: undefined
      },
      temp: {
        monitors_id: undefined,
        monitors_name: undefined,
        monitors_type: undefined,
        monitors_target: undefined,
        monitors_status: undefined,
        monitors_insert_time: undefined,
        monitors_username: undefined
      },
      listLoading: true,
      dialogFormVisible: false,
      deleteVisible: false,
      rules: {
        monitors_name: [{ required: true, message: 'monitor name is required', trigger: 'blur' }],
        monitors_type: [{ required: true, message: 'monitor type is required', trigger: 'change' }],
        monitors_target: [{ required: true, message: 'host ip  is required', trigger: 'change' }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ])
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getMonitors(this.listQuery).then(response => {
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
        monitors_id: undefined,
        monitors_name: undefined,
        monitors_type: undefined,
        monitors_target: undefined,
        monitors_status: undefined,
        monitors_insert_time: undefined,
        monitors_username: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.handleFetchHosts()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.monitors_target = this.temp.monitors_target + ':9100'
          createMonitors(this.temp).then(() => {
            this.fetchData()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '添加成功',
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
      deleteMonitors(tempData.monitors_id).then(() => {
        this.deleteVisible = false
        this.$notify({
          title: '成功',
          message: '删除监控项成功',
          type: 'success',
          duration: 2000
        })
        this.fetchData()
      })
    },
    handleFetchHosts() {
      this.hostsOptions = []
      getHosts().then(response => {
        response.data.forEach(item => {
          const flag = this.hostsOptions.some(e => {
            if (item.hosts_ipaddress === e) {
              return true
            }
          })
          if (!flag) {
            this.hostsOptions.push(item.hosts_ipaddress)
          }
        })
      })
    },
    handleCheckNode() {
      getNodeStatus().then(response => {
        this.$notify({
          title: '成功',
          message: '检查监控状态成功',
          type: 'success',
          duration: 2000
        })
        this.fetchData()
      })
    },
    getDeleteRole(row) {
      const name = this.name
      const role = this.roles.join(' | ')
      if (role === 'admin') {
        return true
      } else if (name === row.monitors_username) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>
