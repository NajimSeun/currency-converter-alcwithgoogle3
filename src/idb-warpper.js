import db from "./currency-converter-db";

class IDBWrapper {


    static doesCountryDBExist() {
        return db.countries.count();
    }
    //Returns the last primary of the added object 
    static addAll_country(countries) {
        return db.countries.bulkAdd(countries);
    }

     
    static doesExchangeRateExist(id){
        return db.exchange_rates.where({id:id}).count() ;
    }     

    static add_rate(rate) {
        db.exchange_rates.add(rate);
    }

    static getExchangeRate(id){
        return db.exchange_rates.where({id:id});
    }

     

    

    static getAllCountries(){
        return db.countries.toArray();
        
    }
}

module.exports = IDBWrapper;

