export type CodeData = {
    args: {
        name: string;
        type: string;
    }[];
    bodyLines: string[];
    bodyLinesRange: number[];
    outputs: {
        type: string;
        name: string;
    }[];
}

export const getCodeData = (code: string): CodeData => {
    let isArgs = false
    const args: { name: string, type: string }[] = []

    const codeLines = code.split("\n")

    const bodyLinesRange: {
        start?: number
        end: number
    } = {
        end: codeLines.length - 1
    }

    for( const [row, line] of codeLines.entries() ){
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
    }

    if (!bodyLinesRange.start) throw new Error(`${code}\nbodyLinesの範囲の最初のインデックスを見つけられませんでした`)

    const bodyLines = codeLines.slice(bodyLinesRange.start-1, bodyLinesRange.end - 1)

    const returnLine = codeLines[codeLines.length - 2].replace(/\s+/g, '')
    const outputNames = returnLine.slice(7, returnLine.length - 1).split(",")
    const outputs = (outputNames.length == 1 && outputNames[0] == "")
        ? []
        :outputNames.map((outputName) => {
            return {
                type: "?",
                name: outputName
            }
        })

    return {
        args,
        bodyLines,
        bodyLinesRange: [
            bodyLinesRange.start, 1,
            bodyLinesRange.end - 1, codeLines[bodyLinesRange.end - 2].length + 1,
        ],
        outputs
    }
}