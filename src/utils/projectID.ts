import { computed } from "vue"

const localStorageSaveID = "latestProjectID"
export const projectID = computed<string | null>({
    get() {
        return localStorage.getItem(localStorageSaveID)
    },
    set(newProjectID) {
        if (newProjectID == null){
            localStorage.removeItem(localStorageSaveID)
            return
        }else{
            localStorage.setItem(localStorageSaveID, newProjectID)
        }
    }
})