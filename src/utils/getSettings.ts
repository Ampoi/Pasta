export function getSettings(code: string) {
    let isPastaSetting = false
    const settings: Record<string, string> = {}
    code.split("\n").forEach((line) => {
        if (line == "// == PASTA START ==") {
            isPastaSetting = true
        } else if (line == "// === PASTA END ===") {
            isPastaSetting = false
        } else if (isPastaSetting) {
            const settingText = line.slice(3, line.length)

            let separateSymbolIndex: number | undefined = undefined
            for (let i = 0; i < settingText.length; i++) {
                if (settingText.slice(i, i + 2) == ": ") separateSymbolIndex = i
            }
            if (typeof separateSymbolIndex != "number") throw new Error("分割シンボルを見つけられませんでした")
            console.log(separateSymbolIndex)

            const key = settingText.slice(0, separateSymbolIndex)
            const value = settingText.slice(separateSymbolIndex + 2, settingText.length)
            settings[key] = value
        }
    })

    return settings
}