class ExchangeRate{

    constructor({id,fr,to,val}){
        this.id = id ;
        this.fr = fr ;
        this.to = to ;
        this.val = val ;
    }

    exchange(amount){
        return amount * this.val ;
    }
    toJsonString(){
        return `{id:${this.id},fr:${this.fr},to:${this.to},val:${this.val}}`
;    }
}

module.exports = ExchangeRate ;