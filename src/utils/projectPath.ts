import { appDataDir as getAppDataDir } from "@tauri-apps/api/path";
import { computed } from "vue";
import { projectID } from "./projectID";

const appDataDir = await getAppDataDir()
const strictlyStringProjectID = computed(() => {
    if( projectID.value == null ) throw new Error("ProjectID is null")
    return projectID.value
})

export const projectPath = computed(() => `${appDataDir}projects/${strictlyStringProjectID.value}`)