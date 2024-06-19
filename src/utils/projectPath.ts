import { computed } from "vue";
import { projectID } from "./projectID";
import { projectsDir } from "../constants/settings";

const strictlyStringProjectID = computed(() => {
    if( projectID.value == null ) throw new Error("ProjectID is null")
    return projectID.value
})

export const projectPath = computed(() => `${projectsDir}/${strictlyStringProjectID.value}`)