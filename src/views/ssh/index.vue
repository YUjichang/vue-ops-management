<template>
  <div class="act-form">
    <iframe
      id="my-iframe"
      :src="url"
      frameborder="0"
      scrolling="no"
      style="width:100%;height:100%;"
    />
  </div>
</template>

<script>
import { getHosts, getURL } from '@/api/hosts/table'

export default {
  name: 'WebSsh',
  data() {
    return {
      listQuery: {
        hostname: undefined
      },
      urlQuery: {
        name: 'ssh'
      },
      websshUrl: undefined,
      hostname: '',
      port: 22,
      username: 'root',
      password: '',
      url: undefined
    }
  },
  mounted() {
    const oIframe = document.getElementById('my-iframe')
    const deviceHeight = document.documentElement.clientHeight
    oIframe.style.height = (Number(deviceHeight - 5)) + 'px'
  },
  created() {
    this.getSshUrl()
    this.connectSsh()
  },
  methods: {
    connectSsh() {
      this.listQuery.hostname = this.$route.query.name
      getHosts(this.listQuery).then(response => {
        this.hostname = response.data[0].hosts_ipaddress
        this.port = response.data[0].hosts_port
        this.username = response.data[0].hosts_username
        this.password = response.data[0].hosts_password
        this.url = this.websshUrl + '?hostname=' + this.hostname + '&port=' + this.port + '&username=' + this.username + '&password=' + this.password
      })
    },
    getSshUrl() {
      getURL(this.urlQuery).then(response => {
        this.websshUrl = response.data.path
      })
    }
  }
}
</script>
