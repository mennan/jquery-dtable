<template>
  <table class="table table-hover table-striped table-condensed" id="users_table">
    <thead class="th-style">
      <tr>
        <th v-for="headerRow in headerRows" :class="headerRow.class" :data-sort="headerRow.sort" :data-field="headerRow.field" :data-filter-type="headerRow.filterType" :data-filter-data="headerRow.filterData">{{ headerRow.text }}</th>
      </tr>
    </thead>
  </table>
</template>
<script>
  export default {
    name: 'dtable',
    props: {
      headerRows: Array,
      tableClass: String,
      tableId: String
    },
    data() {
      return {
        headerRows: this.headerRows || [],
        tableClass: this.tableClass || "table table-hover table-striped table-condensed",
        tableId: this.tableId || ""
      }
    }
  }
</script>