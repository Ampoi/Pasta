export class Que {
    constructor(
        private readonly func: () => void,
        private readonly delay: number
    ){}

    private que: number | undefined = undefined

    public add(){
        if( this.que ) clearTimeout(this.que)
        this.que = setTimeout(() => {
            clearTimeout(this.que)
            this.func()
        }, this.delay)
    }

    public delete(){
        if( this.que ) clearTimeout(this.que)
    }
}