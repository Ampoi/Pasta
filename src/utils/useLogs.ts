import { ref } from "vue"

type Log = {
    id: number
    message: string
}

export const useLogs = () => {
    const logs = ref<Log[]>([])
    
    const addLog = (log: Log) => {
        const lastLog: Log | undefined = logs.value[logs.value.length - 1]
    
        if (log.id == lastLog?.id) {
            lastLog.message += `\n${log.message}`
        } else {
            logs.value.push(log)
        }
    }

    return { logs, addLog }
}