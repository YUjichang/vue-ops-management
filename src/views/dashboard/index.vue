<template>
  <div class="dashboard-container">
    <aside>
      注意：使用主机管理vnc功能时，远程端需安装vnc server。Windows系统请下载：
      <a href="/user/download/templates/tightvnc-2.8.27-gpl-setup-64bit.msi" target="_blank">tightvnc-2.8.27</a>
    </aside>
    <div class="dashboard-text">{{ name }}, 欢迎你</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
