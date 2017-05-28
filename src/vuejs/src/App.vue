<template>
  <dtable :headerRows="headerRows"></dtable>
</template>

<script>
  import Dtable from './plugins/dtable.vue';
  export default {
    name: 'app',
    components: {
      Dtable
    },
    data() {
      return {
        headerRows: [
          {
            class: "sl",
            sort: false,
            field: "",
            filterType: "",
            filterData: "",
            text: ""
          },
          {
            class: "",
            sort: true,
            field: "UserName",
            filterType: "",
            filterData: "",
            text: "User Name"
          },
          {
            class: "",
            sort: false,
            field: "",
            filterType: "",
            filterData: "",
            text: "Display Name"
          },
          {
            class: "",
            sort: true,
            field: "Email",
            filterType: "",
            filterData: "",
            text: "Email"
          },
          {
            class: "",
            sort: true,
            field: "CreatedDate",
            filterType: "",
            filterData: "",
            text: "Created"
          },
          {
            class: "",
            sort: true,
            field: "State",
            filterType: "dropdown",
            filterData: "filterUserStates",
            text: "State"
          }
        ]
      }
    }
  }
</script>