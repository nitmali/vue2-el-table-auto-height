# vue2-el-table-auto-height


## v-el-table-auto-height 表格自动高度

### 原理：监听浏览器窗体变化、vue update渲染，取容器顶部和整个窗体高度计算容器高度

动态计算el-table的高度，使其底部与页面底部距离保持在一定的数值，包括：初始化动态计算、窗口变化动态计算、宽度变化动态计算（宽度变化可能导致一些元素折行）
* 参数说明：v-el-table-auto-height.noPager:demo="0"
	* .noPager：无分页器时，默认分页器高度28px
	* :demo：自定义容器时的选择器，cless不写点“.”，id要写井号“#”
	* ="0"，自定义底部距离，默认底部距离12px
### stackblitz
* https://stackblitz.com/edit/vue2-el-table-auto-height

### 演示 
* https://vue2-el-table-auto-height.stackblitz.io

### 使用方法
```JavaScript
// 在main.js引入
import elTableAutoHeight from '@/directive/el-table-auto-height/el-table-auto-height
Vue.use(elTableAutoHeight)
```
```JavaScript
<!-- 在表格中使用，默认距离底部12px，默认分页器高度28px已扣除 -->
<el-table
  v-el-table-auto-height
  :data="dataList"
>
  <el-table-column prop="demo" label="demo" />
</el-table>
<!-- 分页器 -->
<div class="block" style="float: right">
  <el-pagination />
</div>


<!-- 自定义底部距离，设置0也存在扣除28px分页器高度 -->
<el-table
  v-el-table-auto-height="0"
  :data="dataList"
>
  <el-table-column prop="demo" label="demo" />
</el-table>


<!-- 自定义选择器，由于vue语法问题，类选择器不写. id选择器需要写# -->
<!-- 没有分页器时加上.noPager -->
<div class="demo" v-el-table-auto-height.noPager:demo></div>
<div id="demo" v-el-table-auto-height.noPager:#demo></div>
```
