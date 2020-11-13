<template>
  <div>
    <div v-if="status===1" v-loading="Loading">
      <div class="grafana-text" @click="handleRedirectPath">
        正在跳转到grafana页面......如没有正常跳转，请手动点击
        <span style="color:#20a0ff">{{ path }}</span>
      </div>
    </div>
    <div v-else>
      <monitors-404 />
    </div>
  </div>
</template>

<script>
import { getURLStatus } from '@/api/monitors/table'
import Monitors404 from '@/views/monitor/404'

export default {
  name: 'MonitorsGrafana',
  components: { Monitors404 },
  data() {
    return {
      listQuery: {
        name: 'grafana'
      },
      path: '',
      Loading: true,
      status: 1
    }
  },
  created() {
    this.getQuery()
  },
  methods: {
    getQuery() {
      this.Loading = true
      getURLStatus(this.listQuery).then(response => {
        this.status = response.data.status
        this.path = response.data.path
        this.Loading = false
        if (this.status === 1) {
          const redirectPath = response.data.path
          window.open(redirectPath, '_blank')
        }
      })
    },
    handleRedirectPath() {
      const redirectPath = this.path
      window.open(redirectPath, '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>
.grafana {
  &-text {
    font-size: 16px;
    line-height: 32px;
    margin-left: 20px;
    margin-top: 10px;
  }
}
</style>
