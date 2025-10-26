import { defineStore } from 'pinia'
import { ref } from 'vue'

export default defineStore('filterConfig', () => {
  const UseResize_BeforeEnhance = ref(false)
  const UseResize_AfterEnhance = ref(false)

  const ResizeWidth_BeforeEnhance = ref(1920)
  const ResizeHeight_BeforeEnhance = ref(1080)

  const ResizeWidth_AfterEnhance = ref(3840)
  const ResizeHeight_AfterEnhance = ref(2160)

  const ReduceLeft_BeforeEnhance = ref(0)
  const ReduceRight_BeforeEnhance = ref(0)
  const ReduceOn_BeforeEnhance = ref(0)
  const ReduceDown_BeforeEnhance = ref(0)

  const ReduceLeft_AfterEnhance = ref(0)
  const ReduceRight_AfterEnhance = ref(0)
  const ReduceOn_AfterEnhance = ref(0)
  const ReduceDown_AfterEnhance = ref(0)

  const UseQTGMC_BeforeEnhance = ref(false)
  const QTGMC_Preset_BeforeEnhance = ref('Slower')

  return {
    UseResize_BeforeEnhance,
    UseResize_AfterEnhance,
    ResizeWidth_BeforeEnhance,
    ResizeHeight_BeforeEnhance,
    ResizeWidth_AfterEnhance,
    ResizeHeight_AfterEnhance,
    ReduceLeft_BeforeEnhance,
    ReduceRight_BeforeEnhance,
    ReduceOn_BeforeEnhance,
    ReduceDown_BeforeEnhance,
    ReduceLeft_AfterEnhance,
    ReduceRight_AfterEnhance,
    ReduceOn_AfterEnhance,
    ReduceDown_AfterEnhance,
    UseQTGMC_BeforeEnhance,
    QTGMC_Preset_BeforeEnhance,
  }
}, {
  persist: true,
})
