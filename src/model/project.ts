export type Project = {
    title: string
}

export const Project = {
    create(): Project {
        return {
            title: "new project"
        }
    }
}