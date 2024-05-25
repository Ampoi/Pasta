export const getBlockData = (code: string) => {
    let isArgs = false
    const args: { name: string, type: string }[] = []

    const codeLines = code.split("\n")

    const bodyLinesRange: {
        start?: number
        end: number
    } = {
        end: codeLines.length - 1
    }

    codeLines.forEach((line, row) => {
        if (row == 0) {
            isArgs = true
        } else if (line == ") => {") {
            isArgs = false
            bodyLinesRange.start = row + 2
        } else if (isArgs) {
            const pairText = line[line.length - 1] == "," ? line.slice(0, line.length - 1) : line
            const [name, type] = pairText.trim().split(": ")
            args.push({ name, type })
        }
    })

    if (!bodyLinesRange.start) throw new Error("bodyLinesの範囲の最初のインデックスを見つけられませんでした")

    const returnLine = codeLines[codeLines.length - 2].replace(/\s+/g, '')
    const returnValueNames = returnLine.slice(7, returnLine.length - 1).split(",")
    const returnValues = returnValueNames.map((returnValueName) => {
        return {
            type: "?",
            name: returnValueName
        }
    })

    return {
        args,
        bodyLinesRange: [
            bodyLinesRange.start, 1,
            bodyLinesRange.end - 1, codeLines[bodyLinesRange.end - 2].length + 1,
        ],
        returnValues
    }
}