import '@testing-library/jest-dom/extend-expect'
import { MpxScroll } from '../../src/platform/builtInMixins/pageScrollMixin'
import Vue from 'vue/dist/vue.common.prod'

describe('test mpx scroll', () => {
  const domApp = document.createElement('div')
  domApp.setAttribute('id', 'app')
  document.body.appendChild(domApp)

  Vue.options.__mpxPageConfig = {
    enablePullDownRefresh: true,
    disableScroll: false
  }

  const app = new Vue({
    template: `
      <div id="app" class="app">
        <div class="page">
          <div class="pull-down-loading" style="height: 0"></div>
        </div>
      </div>
    `
  })
  app.$mount('#app')

  const ms = new MpxScroll('.page')

  window.scrollTo = jest.fn()

  test('el is a dom', () => {
    expect(ms.el).toEqual(document.querySelector('.page'))
  })

  test('startPullDownRefresh', done => {
    ms.startPullDownRefresh()
    setTimeout(() => {
      expect(ms.progress.style.height).toEqual('60px')
      done()
    }, 3000)
  })

  test('stopPullDownRefresh', done => {
    ms.startPullDownRefresh()
    setTimeout(() => {
      ms.stopPullDownRefresh()
      setTimeout(() => {
        expect(ms.progress.style.height).toEqual('0px')
        done()
      }, 1000)
    }, 1000)
  })

  test('regist events and hooks', () => {
    ms.useScroll()
    if (app.$options.__mpxPageConfig.enablePullDownRefresh) {
      ms.usePullDownRefresh()
      ms.hooks.on('pullingDown', app.__mpxPullDownHandler)
      expect(ms.hooks.events.pullingDown.length).toEqual(1)
      expect(ms.eventRegister.disposer.length).toEqual(4)
    } else {
      expect(ms.hooks.events.pullingDown).toEqual(undefined)
      expect(ms.eventRegister.disposer.length).toEqual(1)
    }
  })

  test('page destroy', () => {
    ms.destroy()
    expect(Object.keys(ms.hooks.events).length).toEqual(0)
    expect(ms.eventRegister.disposer.length).toEqual(0)
  })
})
