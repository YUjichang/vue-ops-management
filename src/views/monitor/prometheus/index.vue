<template>
  <div>
    <div v-if="status===1" v-loading="Loading">
      <monitors-table />
    </div>
    <div v-else>
      <monitors-404 />
    </div>
  </div>
</template>

<script>
import { getURLStatus } from '@/api/monitors/table'
import Monitors404 from '@/views/monitor/404'
import MonitorsTable from '@/views/monitor/prometheus/table'

export default {
  name: 'MonitorsPrometheus',
  components: { Monitors404, MonitorsTable },
  data() {
    return {
      listQuery: {
        name: 'prometheus'
      },
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
        this.Loading = false
      })
    }
  }
}
</script>
