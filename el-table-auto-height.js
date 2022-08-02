
// 过渡动画
const TRANSITION_DURATION = '100ms'
// 指令内部变量命名空间
const NAMESPACES = '_elTableAutoHeight_namespaces'

/**
 * el-table自动高度
 * @param Vue
 */
const install = (Vue) => {
  Vue.directive('el-table-auto-height', {
    bind(el, binding, node) {
      if (binding.value === false) {
        return
      }
      // 指令的局限性导致要打破数据单项传递的规则
      // 删除代理
      if (node.componentInstance && node.componentInstance.$props) {
        delete node.componentInstance.$props.height
        // 重新设置代理
        Vue.util.defineReactive(node.componentInstance, 'height')
      }

      node.componentInstance.$nextTick(() => {
        init(el, binding, node)
        doWork(el, binding, node)
      })
    },
    update(el, binding, node) {
      if (binding.value === false) {
        return
      }
      // 检测机制优化 TODO
      const context = getContext(el, binding, node)
      if (!context) {
        return
      }
      if (context.setTimout) {
        clearTimeout(context.setTimout)
      }
      context.setTimout = setTimeout(() => {
        doWork(el, binding, node, false)
      }, 100)
    },
    unbind(el, binding, node) {
      if (!node) {
        return
      }
      const context = getContext(el, binding, node)
      if (!context) {
        return
      }
      if (context.setTimout) {
        clearTimeout(context.setTimout)
      }
      delete node.context[NAMESPACES][getContextKey(el, binding, node)]
    }
  })
}

const init = (el, binding, node) => {
  if (!node.context[NAMESPACES]) {
    node.context[NAMESPACES] = {}
  }
  if (getContext(el, binding, node)) {
    return
  }
  node.context[NAMESPACES][getContextKey(el, binding, node)] = {
    id: Math.random().toString(36).slice(-8),
    // 防抖器
    setTimout: null,
    container: null,
    bottom: null,
    node: node,
    el: el,
    binding: binding,
    tableBody: null
  }
}

const getContext = (el, binding, node) => {
  if (!node.context || !node.context[NAMESPACES]) {
    return null
  }
  const key = getContextKey(el, binding, node)
  return node.context[NAMESPACES][key]
}

const getContextKey = (el, binding, node) => {
  return `${node.tag}-${el.id}-${el.class}-${binding.arg}`
}

/**
 * 处理容器、参数
 * @param el
 * @param binding
 * @param node
 * @param observeFlag 是否创建监听
 */
const doWork = (el, binding, node, observeFlag = true) => {
  const container = binding.arg ? el.querySelector(getSelector(binding)) : el
  if (!container) {
    return
  }

  // 默认距离底部12px
  let bottom = binding.value
  if (!bottom && bottom !== 0) {
    bottom = 12
  }

  // 分页器高度
  if (!binding.modifiers.noPager) {
    bottom += 28
  }
  const context = getContext(el, binding, node)
  if (!context) {
    return
  }
  context.bottom = bottom
  context.container = container
  context.tableBody = container.querySelector('.el-table__body-wrapper')
  context.customize = !!binding.arg

  setHeight(context)
  if (observeFlag) {
    observeContainerChange(context)
  }
}

/**
 * 监听容器变化，由于el-table初始化渲染会导致宽度变化，所以初始化时会被调用多次
 * @param context
 */
const observeContainerChange = (context) => {
  // 宽度变化监听由于el-table内部计算会导致死循环，改为vue渲染变化监听 TODO
  // const config = { attributes: true, childList: true, subtree: true, attributeFilter: ['width'] }
  // const callback = (mutationsList, observer) => {
  //   setHeight(container, bottom, node, elTableFlag)
  // }
  // const observer = new MutationObserver(callback)
  // observer.observe(container, config)

  // 窗口变化监听
  window.addEventListener('resize', () => {
    setHeight(context)
  })
}

/**
 * 设置高度
 * @param context
 */
const setHeight = (context) => {
  const top = context.container.getBoundingClientRect().top
  const innerHeight = window.innerHeight
  let height = innerHeight - top - context.bottom

  const body = context.customize ? null : context.container.querySelector('.el-table__body-wrapper')
  if (body) {
    context.container.style.transitionDuration = TRANSITION_DURATION
    const footer = context.container.querySelector('.el-table__footer-wrapper')
    if (footer) {
      height = height - Number(footer.offsetHeight)
    }
    context.node.componentInstance.height = height
    // 调用内部计算方法
    if (context.node.componentInstance.layout) {
      context.node.componentInstance.layout.setHeight(height)
    }
  } else {
    context.container.style.height = `${height}px`
    context.container.style.overflowY = 'auto'
    context.container.style.transitionDuration = TRANSITION_DURATION
  }
}

/**
 * 获取当前选择器
 * @param binding
 * @returns {string|string}
 */
const getSelector = (binding) => {
  let containerSelector = binding.arg
  if (containerSelector && containerSelector[0] !== '#' && containerSelector[0] !== '.') {
    containerSelector = '.' + containerSelector
  }
  return containerSelector || 'default'
}

export default install
