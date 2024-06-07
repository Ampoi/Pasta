import { Ref, onMounted } from "vue";
import { Callback, Rect } from "../model/utils";

export const useNodeRect = (blockElement: Ref<HTMLElement | undefined>) => {
    let isMounted = false
    let getNodeRectQue: (() => void) | undefined = undefined
    
    const getNodeRect = (callback: Callback<Rect> ) => {
      if( !isMounted ){
        getNodeRectQue = () => getNodeRect(callback)
      }else{
        const blockElementValue = blockElement.value;
        if( !blockElementValue ) throw new Error("blockElement is not defined")
        callback({
          height: blockElementValue.clientHeight,
          width: blockElementValue.clientWidth,
        })
      }
    }
    
    const mountedFunc = () => {
      isMounted = true
      if( getNodeRectQue ){
        getNodeRectQue()
        getNodeRectQue = undefined
      }
    }

    const setupGetNode = () => onMounted(mountedFunc)

    return { setupGetNode, getNodeRect }
}