import Vue from 'vue';
import {Component} from 'vue-property-decorator';
import Template from './template.vue.html?style=./style.vue.css';

@Template
@Component
class App extends Vue {
  created() {
    console.debug('APP',this);
  }
};

export default App;