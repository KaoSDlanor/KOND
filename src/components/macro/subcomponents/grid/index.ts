import Vue from 'vue';
import {Component,PropSync} from 'vue-property-decorator';
import Template from './template.vue.html?style=./style.vue.css';

@Template
@Component
class Grid extends Vue {
  @PropSync('columns',{ type : Number, required : true })
  readonly Columns : number
  @PropSync('rows',   { type : Number, required : true })
  readonly Rows    : number
  
  @PropSync('columnWidth',{ type : Number, required : true })
  readonly ColumnWidth : number
  @PropSync('rowHeight',  { type : Number, required : true })
  readonly RowHeight   : number
  
  get ColumnLines() {
    return Array(this.Columns-1).fill(undefined).map((_,index) => (index+1) * this.ColumnWidth);
  }
  get RowLines() {
    return Array(this.Rows-1).fill(undefined).map((_,index) =>  (index+1) * this.RowHeight);
  }

  created() {
    console.debug('GRID',this);
  }
};

export default Grid;