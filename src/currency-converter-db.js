import  Dexie from "dexie" ;



const db = new Dexie('currency-converter');
db.version(1).stores({
    countries : 'id,name,alpha3',
    exchange_rates : 'id,fr,to'
}) ;

 
module.exports  = db ;

