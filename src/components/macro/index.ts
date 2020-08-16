import Vue from 'vue';
import {Component,Ref,Watch} from 'vue-property-decorator';
import Template from './template.vue.html?style=./style.vue.css';

import {Debounce} from '../../lib/decorators';

import NodeComponent from './subcomponents/node';

// type NodeComponent = InstanceType<typeof import('./subcomponents/node')['default']>;
export type NodeData = {
  Label    : string,
  Selected : boolean,
  Column   : number,
  Row      : number,
  Width    : number,
  Height   : number,
}

@Template
@Component({
  components : {
    'grid-component' : () => import('./subcomponents/grid').then(({ default : Grid }) => Grid),
    'node-component' : () => import('./subcomponents/node').then(({ default : Node }) => Node),
  },
})
class Macro extends Vue {
  @Ref('svg-inner')  readonly SVGInner  : SVGElement
  @Ref('node-group') readonly NodeGroup : SVGGElement

  Columns : number = 10
  Rows    : number = 10

  ColumnWidth : number = 1000 / this.Columns
  RowHeight   : number = 1000 / this.Rows

  NodeDataList : Array<NodeData> = [
    { Label : 'Test1', Selected : false, Column : 2, Row : 3, Width : 1, Height : 1 },
    { Label : 'Test2', Selected : false, Column : 5, Row : 5, Width : 1, Height : 1 },
    { Label : 'Test3', Selected : false, Column : 4, Row : 1, Width : 2, Height : 1 },
  ]
  NodeDataMap     : Map<NodeComponent,NodeData> = new Map()
  NodeInstanceMap : Map<NodeData,NodeComponent> = new Map()

  @Watch('NodeDataList')
  BuildNodes() {
    console.log('Building Node List')
    this.NodeDataMap     = new Map();
    this.NodeInstanceMap = new Map();
    while(this.NodeGroup.firstChild) this.NodeGroup.removeChild(this.NodeGroup.lastChild);

    this.NodeDataList.forEach((NodeData) => {
      const NodeInstance = new NodeComponent({
        propsData : {
          nodeData    : NodeData,
          columnWidth : this.ColumnWidth,
          rowHeight   : this.RowHeight,
        },
      });
      this.NodeDataMap.set(NodeInstance,NodeData);
      this.NodeInstanceMap.set(NodeData,NodeInstance);
      NodeInstance.$mount();
      this.NodeGroup.appendChild(NodeInstance.$el);
    });
  }

  GetMousePos($event: MouseEvent): [number,number] {
    const MacroPos = this.SVGInner.getBoundingClientRect();
    return [
      ($event.clientX - MacroPos.left) * 100 / MacroPos.width,
      ($event.clientY - MacroPos.top) * 100 / MacroPos.height,
    ];
  }
  GetCell(Position: [number,number]): [number,number] {
    return [
      Math.floor(Position[0] / this.Columns),
      Math.floor(Position[1] / this.Rows),
    ]
  }
  GetNode(Position: [number,number]): NodeData {
    return this.NodeDataList.find((NodeData) => {
      return NodeData.Column <= Position[0]
          && NodeData.Column + NodeData.Width - 1 >= Position[0]
          && NodeData.Row <= Position[1]
          && NodeData.Row + NodeData.Height - 1 >= Position[1];
    });
  }

  SelectNodes(NewSelectedNodes: Array<NodeData>) {
    const LastSelectedNodes = this.SelectedNodes;
    this.SelectedNodes = NewSelectedNodes;
    LastSelectedNodes.filter((NodeData) => !this.SelectedNodes.includes(NodeData)).forEach((NodeData) => NodeData.Selected = false);
    this.SelectedNodes.filter((NodeData) => !LastSelectedNodes.includes(NodeData)).forEach((NodeData) => NodeData.Selected = true);

    this.SelectedNodes.forEach((NodeData) => {
      const NodeInstance = this.NodeInstanceMap.get(NodeData);
      NodeInstance.$el.parentElement.appendChild(NodeInstance.$el);
    });
  }

  SelectedNodes    : Array<NodeData>              = []
  DragStartCell?   : [number,number]              = null
  DragCurrentCell? : [number,number]              = null
  DragOperation?   : 'MOVE' | 'RESIZE' | 'SELECT' = null
  DragStart($event: MouseEvent) {
    if (!($event.target instanceof Element)) return;
    this.DragStartCell = this.DragCurrentCell = this.GetCell(this.GetMousePos($event));
    const DragControl = $event.target.closest('.node-control-move,.node-control-resize');
    const DragElem = $event.target.closest('.node');
    const DragNode = Array.from(this.NodeDataMap.keys()).find((Node) => Node.$el === DragElem);
    const NodeData = this.NodeDataMap.get(DragNode);

    if (!NodeData) {
      this.DragOperation = 'SELECT';
      this.SelectNodes([]);
    } else if (!DragControl) {
      if ($event.shiftKey) {
        this.SelectNodes([...this.SelectedNodes,NodeData]);
      } else {
        this.SelectNodes([NodeData]);
      }
    } else if (DragControl.classList.contains('node-control-move')) {
      if (!$event.shiftKey && !this.SelectedNodes.includes(NodeData)) this.SelectNodes([NodeData]);
      this.DragStartCell = this.DragCurrentCell = [NodeData.Column + NodeData.Width - 1,NodeData.Row];
      this.DragOperation = 'MOVE';
    } else if (DragControl.classList.contains('node-control-resize')) {
      if ($event.shiftKey || this.SelectedNodes.includes(NodeData)) {
        this.SelectNodes([...this.SelectedNodes.filter((SelectedNode) => SelectedNode !== NodeData),NodeData]);
      } else {
        this.SelectNodes([NodeData]);
      }
      this.DragOperation = 'RESIZE';
    }

    console.log(this.DragStartCell,this.SelectedNodes,this.DragOperation);
  }
  @Debounce(100)
  DragMove($event: MouseEvent) {
    if (!this.DragStartCell) return;
    this.DragCurrentCell = this.GetCell(this.GetMousePos($event));
    if (this.DragOperation === 'SELECT') {
      const Bounds = this.DragBounds;

      const MatchingNodes = Array.from(this.NodeInstanceMap.keys()).filter((NodeData) => {
        return NodeData.Column >= Bounds[0]
            && NodeData.Column + NodeData.Width - 1 <= Bounds[2]
            && NodeData.Row >= Bounds[1]
            && NodeData.Row + NodeData.Height - 1 <= Bounds[3];
      });

      this.SelectNodes(MatchingNodes);
    } else if (this.DragOperation === 'MOVE') {
      this.SelectedNodes.forEach((NodeData) => {
        NodeData.Column = NodeData.Column + this.DragCurrentCell[0] - this.DragStartCell[0];
        NodeData.Row    = NodeData.Row    + this.DragCurrentCell[1] - this.DragStartCell[1];
      });
      this.DragStartCell = this.DragCurrentCell;
    } else if (this.DragOperation === 'RESIZE') {
      const ResizeNode = this.SelectedNodes[this.SelectedNodes.length - 1];
      ResizeNode.Width  = Math.max(1,this.DragCurrentCell[0] + 1 - ResizeNode.Column);
      ResizeNode.Height = Math.max(1,this.DragCurrentCell[1] + 1 - ResizeNode.Row);
    }
  }
  DragEnd($event: MouseEvent) {
    if (this.DragOperation === 'MOVE') {
      this.SelectedNodes.forEach((NodeData) => {
        NodeData.Column = Math.min(this.Columns,Math.max(0,NodeData.Column));
        NodeData.Row    = Math.min(this.Rows,   Math.max(0,NodeData.Row   ));
      });
    }
    this.DragStartCell = this.DragCurrentCell = this.DragOperation = null;
  }

  get DragBounds(): [number,number,number,number] {
    return [
      Math.min(this.DragStartCell[0],this.DragCurrentCell[0]),
      Math.min(this.DragStartCell[1],this.DragCurrentCell[1]),
      Math.max(this.DragStartCell[0],this.DragCurrentCell[0]),
      Math.max(this.DragStartCell[1],this.DragCurrentCell[1]),
    ];
  }

  created() {
    console.debug('MACRO',this);
  }
  mounted() {
    this.BuildNodes();
  }
};

export default Macro;