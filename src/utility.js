import Country from './country';
class Utility{

    static processCountries(country_json) {

        let countries = [];
        Object.entries(country_json).forEach(([key, value]) => {
    
            let c = new Country(value);
            countries.push(c);
        })
    
        return countries;
    }


     
}

module.exports = Utility ;