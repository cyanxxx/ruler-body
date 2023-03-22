// pages/components/icon-text.ts
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    iconName: {
      type: String,
    },
    iconSize: {
      type: Number,
      value: 24
    },
    text: {
      type: String
    },
    prefix: {
      type: String,
      value: ''
    }

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTap(this: any, e: WechatMiniprogram.TapEvent) {
      console.log(e)
      this.triggerEvent('icontap', e)
    }
  }
})
