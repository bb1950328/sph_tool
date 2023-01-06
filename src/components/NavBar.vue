<template>
  <nav class="navbar fixed-top">
    <div class="container-fluid">
      <a class="navbar-brand" href="#" aria-label="Home"></a>
      <button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvas-navbar"
              aria-controls="offcanvas-navbar" aria-label="Open Navigation">
        <font-awesome-icon icon="fa-solid fa-bars"/>
      </button>
      <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvas-navbar"
           aria-labelledby="offcanvas-navbar-label">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvas-navbar-label">Menu</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"
                  aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
            <li class="nav-item" v-for="sp in subpageRoutes" :key="sp.path">
              <router-link :to="sp.path" class="nav-link">
                {{ sp.name }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import {toolRoutes} from "@/main";

export default {
  name: "NavBar",
  data() {
    return {
      subpageRoutes: toolRoutes,
    }
  }
}
</script>

<style scoped>
#offcanvas-navbar {
  --bs-offcanvas-width: 15rem;
}
.navbar>.container-fluid {
  align-items: flex-end;
  justify-content: flex-end;
}
.fixed-top {
  left: initial;
}
</style>