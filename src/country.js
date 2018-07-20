
class Country{

    constructor({alpha3,currencyId,currencyName,currencySymbol,id,name}){
        this.alpha3 = alpha3 ;
        this.currencyId = currencyId ;
        this.currencyName = currencyName ;
        this.currencySymbol = currencySymbol ;
        this.id = id ;
        this.name = name ;
        this.flagUrl = this.getCountryFlagUrl() ;
    }

    getCountryFlagUrl() {

        return ` http://www.countryflags.io/${this.id}/flat/48.png`
     }



}

module.exports = Country ;