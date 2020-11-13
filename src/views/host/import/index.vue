<template>
  <div class="app-container">
    <upload-excel-component :on-success="handleSuccess" :before-upload="beforeUpload" :import-data="importData" />
    <el-button style="float:right;margin-bottom:15px;" class="filter-item" type="primary" icon="el-icon-download" @click="handleExport">模板下载</el-button>
  </div>
</template>

<script>
import UploadExcelComponent from '@/components/UploadExcel/index.vue'
import { importHosts } from '@/api/hosts/table'

export default {
  name: 'HostImport',
  components: { UploadExcelComponent },
  methods: {
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 5

      if (isLt1M) {
        return true
      }

      this.$message({
        message: 'Please do not upload files larger than 5m in size.',
        type: 'warning'
      })
      return false
    },
    handleSuccess() {
      console.log('success')
    },
    importData(file) {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
      const formdata = new FormData()
      formdata.append('file', file)
      importHosts(formdata, config).then(() => {
        this.$notify({
          title: '成功',
          message: '批量导入成功',
          type: 'success',
          duration: 2000
        })
        this.$router.push('/host')
      })
    },
    handleExport() {
      var elemIF = document.createElement('iframe')
      elemIF.src = '/user/download/templates/主机导入模板.xlsx'
      elemIF.style.display = 'none'
      document.body.appendChild(elemIF)
    }
  }
}
</script>
