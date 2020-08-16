import Vue from 'vue';
import {Component,PropSync} from 'vue-property-decorator';
import Template from './template.vue.html?style=./style.vue.css';

import {NodeData} from '../../index';

@Template
@Component
class Node extends Vue {
  @PropSync('nodeData',   { type : Object, required : true })
  readonly NodeData    : NodeData
  @PropSync('columnWidth',{ type : Number, required : true })
  readonly ColumnWidth : number
  @PropSync('rowHeight',  { type : Number, required : true })
  readonly RowHeight   : number

  ControlScale : number = .333

  get X() {
    return this.NodeData.Column * this.ColumnWidth;
  }
  get Y() {
    return this.NodeData.Row * this.RowHeight;
  }
  get Width() {
    return this.NodeData.Width * this.ColumnWidth;
  }
  get Height() {
    return this.NodeData.Height * this.RowHeight;
  }
  get RX() {
    return this.ColumnWidth * .1;
  }
  get RY() {
    return this.RowHeight * .1;
  }
  get NodeStyle() {
    return {
      '--width'          : this.NodeData.Width,
      '--height'         : this.NodeData.Height,
      '--control-width'  : this.ColumnWidth * this.ControlScale,
      '--control-height' : this.RowHeight   * this.ControlScale,
    }
  }

  created() {
    console.debug('NODE',this);
  }
};

export default Node;