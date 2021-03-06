import { computed, Ref } from 'vue'
import { MutationTypes, useStore } from '@/store'
import { CreateElementSelectionData, CreatingLineElement, CreatingShapeElement } from '@/types/edit'
import useCreateElement from '@/hooks/useCreateElement'

export default (viewportRef: Ref<HTMLElement | undefined>) => {
  const store = useStore()
  const canvasScale = computed(() => store.state.canvasScale)
  const creatingElement = computed(() => store.state.creatingElement)

  const formatCreateSelection = (selectionData: CreateElementSelectionData) => {
    const { start, end } = selectionData

    if (!viewportRef.value) return
    const viewportRect = viewportRef.value.getBoundingClientRect()

    const [startX, startY] = start
    const [endX, endY] = end
    const minX = Math.min(startX, endX)
    const maxX = Math.max(startX, endX)
    const minY = Math.min(startY, endY)
    const maxY = Math.max(startY, endY)

    const left = (minX - viewportRect.x) / canvasScale.value
    const top = (minY - viewportRect.y) / canvasScale.value
    const width = (maxX - minX) / canvasScale.value
    const height = (maxY - minY) / canvasScale.value

    return { left, top, width, height }
  }

  const formatCreateSelectionForLine = (selectionData: CreateElementSelectionData) => {
    const { start, end } = selectionData

    if (!viewportRef.value) return
    const viewportRect = viewportRef.value.getBoundingClientRect()

    const [startX, startY] = start
    const [endX, endY] = end
    const minX = Math.min(startX, endX)
    const maxX = Math.max(startX, endX)
    const minY = Math.min(startY, endY)
    const maxY = Math.max(startY, endY)

    const left = (minX - viewportRect.x) / canvasScale.value
    const top = (minY - viewportRect.y) / canvasScale.value
    const width = (maxX - minX) / canvasScale.value
    const height = (maxY - minY) / canvasScale.value

    const _start: [number, number] = [
      startX === minX ? 0 : width,
      startY === minY ? 0 : height,
    ]
    const _end: [number, number] = [
      endX === minX ? 0 : width,
      endY === minY ? 0 : height,
    ]

    return {
      left,
      top,
      start: _start,
      end: _end,
    }
  }

  const { createTextElement, createShapeElement, createLineElement } = useCreateElement()

  const insertElementFromCreateSelection = (selectionData: CreateElementSelectionData) => {
    if (!creatingElement.value) return

    const type = creatingElement.value.type
    if (type === 'text') {
      const position = formatCreateSelection(selectionData)
      position && createTextElement(position)
    }
    else if (type === 'shape') {
      const position = formatCreateSelection(selectionData)
      position && createShapeElement(position, (creatingElement.value as CreatingShapeElement).data)
    }
    else if (type === 'line') {
      const position = formatCreateSelectionForLine(selectionData)
      position && createLineElement(position, (creatingElement.value as CreatingLineElement).data)
    }
    store.commit(MutationTypes.SET_CREATING_ELEMENT, null)
  }

  return {
    insertElementFromCreateSelection,
  }
}