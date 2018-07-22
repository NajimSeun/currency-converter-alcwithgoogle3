import idb from './idb-warpper';
import Utility from './utility';
import ExchangeRate from './exchange-rate';



const STATIC_CACHE = 'currency-converter-static-cache_v1';

//const CURRENCY_CONVERTER_CACHE = 'currency_converter_cache_v1' ;


const CURRENCY_CONVERTER_URL = 'https://free.currencyconverterapi.com/api/v5/';


const static_urls = [
    './index.html',
    './css/main.css',
    './js/index.js',
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
    'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
    'https://code.jquery.com/jquery-3.2.1.slim.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js',
    'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js'];





self.addEventListener('install', e => {
     console.log('install')
      
    e.waitUntil(

        caches.open(STATIC_CACHE).then(cache => {
            return cache.addAll(static_urls);
        })
    );
});

self.addEventListener('activate', event => {
    const currentCaches = [STATIC_CACHE];
     console.log('activate called');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then( () => {
            clients.claim()
        }) 
    );
});

self.addEventListener('fetch', e => {
     
    
    console.log(e.request.url);
    if (e.request.url.startsWith(CURRENCY_CONVERTER_URL)) {
        if (e.request.url.includes('countries')) {
            console.log(e.request);
            console.log('about to process countries')
            e.respondWith(new Promise((resolve, reject) => {
                processCountriesRequest(e.request).then(countries_json => {
                    (createResponse(countries_json, e.request.url)).json(json => {
                        console.log(json)
                    })
                    resolve(createResponse(countries_json, e.request.url));
                })
            }))
        } else if (e.request.url.includes('convert')) {
            e.respondWith(new Promise((resolve , reject) => {
                processConvertUrlRequest(e.request).then(res =>{
                    console.log(`res  is `)
                    console.log(res)
                    resolve(createResponse(res ,''))
                })
            }));
        }

    }
    else {
        if (!e.request.url.includes('sockjs-node')) {
            e.respondWith(processStaticAssetRequest(e.request));
        }
    }



})



function processCountriesRequest(request) {
    return new Promise((resolve, reject) => {
        idb.doesCountryDBExist().then(count => {
            if (count === 0) {


                fetch(request).then(response => {
                    response.json().then(countries_json => {
                        console.log(countries_json)
                        const countries = Utility.processCountries(countries_json.results);
                        idb.addAll_country(countries).then(last_key => {
                            idb.getAllCountries().then(array => {
                                console.log(array)
                                resolve(array);
                            }) 

                        })

                    });
                }).catch(e => {
                    reject(e)
                })
            }else{
                 idb.getAllCountries().then(array => {
                console.log(array)
                resolve(array);
            })
            }
           
            
        })

    })
}

function createResponse(json, url) {
    console.log(json)
    console.log(JSON.stringify(json))
    return new Response(JSON.stringify(json), {
        ok: true,
        status: 200,
        url: url,
        statusText: 'ok'


    });

}

function processStaticAssetRequest(request) {
    return new Promise((resolve, reject) => {
        caches.open(STATIC_CACHE).then(static_cache => {

            static_cache.match(request).then(response => {
                if (response) {

                    resolve(response);
                } else {
                    fetch(request).then(response => {


                        const clone = response.clone();
                        static_cache.put(request, clone);
                        resolve(response);

                    })
                }
            })
        })
    })
}

function processConvertUrlRequest(request) {
    return new Promise((resolve, reject) => {
        const no_base = request.url.replace(`${CURRENCY_CONVERTER_URL}convert?q=`, '');
        if (request.url.includes('&compact=ultra')) {
            console.log(request.url);
            const id = no_base.replace('&compact=ultra', '');
            console.log(`${id} id  to lookup`)
            processExchangeRequest(request, id).then(er => {
                console.log(er.toJsonString())
                console.log(createResponse(er, request.url).json())
                resolve(er)
            })
        } else {
             
                
                processNonCompactUrl(request).then(er => console.log(er))
            
            resolve('saved for use');
        }
    });
}

function processExchangeRequest(request, id) {
    return new Promise((resolve, reject) => {

        const exchngeRateCollection = idb.getExchangeRate(id);
        exchngeRateCollection.first(exr => {
            if (exr) {
                console.log(`${exr} gotten from db`)
                const er = new ExchangeRate(exr);

                console.log(`er ${er}`)
                resolve(er);
            } else {
                console.log(`no dey db fetching`)
                fetch(request).then(response => {
                    console.log(response);
                    response.json().then(data => {
                          
                            processSingleExchange(data).then(ex => {
                                saveExchangeRate(ex);
                                resolve(ex);
                            })
                        
                    })

                })
            }

        })
    })


}

function processExchangeRates(data) {

    return new Promise((resolve, reject) => {
        const exs = [];
        Object.entries(data).forEach(([key, value]) => {
            const ex = new ExchangeRate(value);
            console.log(ex);

            exs.push(ex);

        })
        resolve(exs);
    })
}

function processSingleExchange(data) {
    console.log(`${data} data`)
    return new Promise((resolve, reject) => {
        let id, value;
        Object.keys(data).forEach(key => {
            id = key;
            value = data[key];
        });
        console.log(`${id} ${value}`)

        const ex = new ExchangeRate({ id: id, fr: id.slice(0, 3), to: id.slice(4), val: value });
        console.log(ex)
        resolve(ex);
    })
}

function saveExchangeRate(rate) {
    idb.doesExchangeRateExist(rate.id).then(count => {
        console.log(`count is ${count}`)
        if (count > 0) {
            console.log(`returning without saving`)
            return;
        }
        console.log(`returing after saving`)
        console.log('saving in idb');
        idb.add_rate(rate);
        return;
    })




}

function processNonCompactUrl(request) {

    return new Promise((resolve, reject) => {
        const no_base = request.url.replace(`${CURRENCY_CONVERTER_URL}convert?q=`, '');
        const ids = no_base.split(',');

        idb.doesExchangeRateExist(ids[0]).then(count => {
            if (count === 0) {
                idb.doesExchangeRateExist(ids[1]).then(count => {
                    if (count === 0) {
                        fetch(request).then(response => {
                            response.json().then(data => {
                                console.log(data);
                                processExchangeRates(data.results).then(ers => {
                                    ers.forEach(er => {
                                        saveExchangeRate(er) ;
                                    })
                                })
                            })
                        })
                    } else {
                        constructThenProcess(ids[0]);
                    }
                })
            } else {
                constructThenProcess(ids[1]);
            }
        })

        resolve('done');

    })
}

function constructUrl(id) {
    return `https://free.currencyconverterapi.com/api/v6/convert?q=${id}&compact=ultra`
}

function constructThenProcess(id) {
    fetch(constructUrl(id), { mode: 'cors' }).then(response => {
        response.json().then(data => {
            processSingleExchange(data).then(ex => {
                saveExchangeRate(ex);
            })
        })
    })
}