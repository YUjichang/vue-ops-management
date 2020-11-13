<template>
  <div class="app-container">
    <!-- 工具栏  -->
    <div class="filter-container">
      <el-input v-model="listQuery.filename" placeholder="文件名" prefix-icon="el-icon-search" style="width: 400px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 20px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-upload
        ref="upload"
        class="filter-item"
        action="#"
        :http-request="handleUpload"
        :before-upload="beforeUpload"
        multiple
        :limit="1"
        :on-exceed="handleUploadExceed"
        :show-file-list="false"
      >
        <el-button style="margin-left: 10px;" type="primary" icon="el-icon-upload2">
          上传
        </el-button>
      </el-upload>
      <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-folder-add" @click="handleCreate">
        创建目录
      </el-button>
      <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-house" @click="handleHomePage">
        返回
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
      <el-table-column label="名称" width="250" align="center">
        <template slot-scope="{row}">
          <div v-if="row.type == 'dir'">
            <span class="link-type" @click="handleInDir(row)">{{ row.name }}</span>
          </div>
          <div v-else>
            <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="110" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.type == 'dir'">
            <svg-icon icon-class="dir" class="meta-item__icon" />
            目录
          </div>
          <div v-else>
            <svg-icon icon-class="file" class="meta-item__icon" />
            文件
          </div>
        </template>
      </el-table-column>
      <el-table-column label="大小" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.size }}
        </template>
      </el-table-column>
      <el-table-column label="修改时间" width="200" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.mtime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下载地址" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" icon="el-icon-download" :disabled="row.type === 'dir'?true:false" @click="handleDownload(row)" />
          <el-button size="mini" type="danger" icon="el-icon-delete" :disabled="row.type === 'dir'?true:false" @click="handleDelete(row)" />
          <el-button size="mini" type="primary" :disabled="row.type === 'dir'?true:false" @click="handleScpFile(row)">
            scp
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <!-- 弹窗界面 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="文件名" prop="name">
          <el-input v-model="temp.name" />
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

    <el-dialog title="拷贝文件到远程服务器" :visible.sync="scpFileVisible">
      <el-form ref="scpFileForm" :rules="fileRules" :model="fileTemp" label-position="right" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="文件名">
          <el-input v-model="fileTemp.name" :disabled="true" />
        </el-form-item>
        <el-form-item label="远程主机" prop="hostname">
          <el-select v-model="fileTemp.hostname" placeholder="请选择" clearable filterable class="filter-item">
            <el-option v-for="item in hostOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标路径" prop="target_path">
          <el-input v-model="fileTemp.target_path" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="scpFileVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="scpFile()">
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
import { getFiles, updateFiles, deleteFiles, createFiles, createDir, moveFiles } from '@/api/files/table'
import { getHosts } from '@/api/hosts/table'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'

export default {
  name: 'FileTable',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: null,
      total: 0,
      listQuery: {
        page: 1,
        limit: 20,
        dirname: undefined,
        filename: undefined
      },
      temp: {
        name: undefined,
        type: undefined,
        size: undefined,
        mtime: undefined,
        url: undefined,
        path: undefined,
        current_path: undefined
      },
      fileTemp: {
        name: undefined,
        hostname: undefined,
        local_path: undefined,
        target_path: '/tmp'
      },
      listLoading: true,
      hostOptions: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改文件名',
        create: '创建目录'
      },
      deleteVisible: false,
      scpFileVisible: false,
      rules: {
        name: [{ required: true, message: 'file name is required', trigger: 'blur' }]
      },
      fileRules: {
        hostname: [{ required: true, message: 'host is required', trigger: 'change' }],
        target_path: [{ required: true, message: 'target file path is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getFiles(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    handleHomePage() {
      this.listQuery.dirname = undefined
      this.listQuery.filename = undefined
      this.fetchData()
    },
    handleInDir(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.listQuery.dirname = this.temp.path
      this.fetchData()
    },
    handleCreate() {
      this.temp.name = ''
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const data = { name: this.temp.name, path: this.listQuery.dirname ? this.listQuery.dirname : '' }
          createDir(data).then(() => {
            this.fetchData()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '创建目录成功',
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
          updateFiles(tempData).then(() => {
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
      deleteFiles(tempData).then(() => {
        this.deleteVisible = false
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        this.fetchData()
      })
    },
    handleDownload(row) {
      this.temp = Object.assign({}, row)
      const url = this.temp.url
      var elemIF = document.createElement('iframe')
      elemIF.src = url
      elemIF.style.display = 'none'
      document.body.appendChild(elemIF)
    },
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 100
      if (isLt1M) {
        return true
      }
      this.$message({
        message: 'Please do not upload files larger than 100m in size.',
        type: 'warning'
      })
      return false
    },
    handleUploadExceed(files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    handleUpload(data) {
      const { file } = data
      const dirname = this.listQuery.dirname ? this.listQuery.dirname : ''
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
      const formdata = new FormData()
      formdata.append('file', file)
      formdata.append('path', dirname)
      createFiles(formdata, config).then(() => {
        this.$notify({
          title: '成功',
          message: '导入成功',
          type: 'success',
          duration: 2000
        })
        this.fetchData()
        this.$refs.upload.clearFiles()
      })
    },
    handleFetchHost() {
      this.hostOptions = []
      getHosts().then(response => {
        response.data.forEach(item => {
          this.hostOptions.push(item.hosts_hostname)
        })
      })
    },
    handleScpFile(row) {
      this.temp = Object.assign({}, row)
      this.fileTemp.local_path = this.temp.path
      this.fileTemp.name = this.temp.name
      this.handleFetchHost()
      this.scpFileVisible = true
      this.$nextTick(() => {
        this.$refs['scpFileForm'].clearValidate()
      })
    },
    scpFile() {
      this.$refs['scpFileForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.fileTemp)
          moveFiles(tempData).then(() => {
            this.scpFileVisible = false
            this.$notify({
              title: '成功',
              message: '拷贝文件成功',
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
