<template>
  <div id="screen" />
</template>

<script>
import { getHosts, getURL } from '@/api/hosts/table'
import RFB from '@novnc/novnc/core/rfb'
import { Base64 } from 'js-base64'

export default {
  name: 'NoVnc',
  data() {
    return {
      listQuery: {
        hostname: undefined
      },
      urlQuery: {
        name: 'vnc'
      },
      vncUrl: undefined,
      rfb: null,
      url: '',
      password: ''
    }
  },
  mounted() {
    this.getVncUrl()
  },
  methods: {
    disconnectedFromServer(msg) {
      if (msg.detail.clean) {
        this.contentVnc()
      } else {
        console.log('logout')
      }
    },
    connectedToServer() {
      console.log('success')
    },
    connectVnc() {
      this.listQuery.hostname = this.$route.query.name
      getHosts(this.listQuery).then(response => {
        this.password = response.data[0].hosts_password
        this.url = this.vncUrl + '/path?token=' + this.listQuery.hostname
        const passWord = Base64.decode(this.password)
        const rfb = new RFB(document.getElementById('screen'), this.url, {
          credentials: { password: passWord }
        })
        rfb.addEventListener('connect', this.connectedToServer)
        rfb.addEventListener('disconnect', this.disconnectedFromServer)
        this.rfb = rfb
      })
    },
    getVncUrl() {
      getURL(this.urlQuery).then(response => {
        this.vncUrl = response.data.path
      })
      this.connectVnc()
    }
  }
}
</script>
