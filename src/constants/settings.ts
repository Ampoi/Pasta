import { documentDir } from "@tauri-apps/api/path"

export const accessibleDataDir = `${await documentDir()}Pasta`
export const projectsDir = `${accessibleDataDir}/projects`