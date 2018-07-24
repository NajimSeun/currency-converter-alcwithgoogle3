import idb from "./idb-warpper";
import TemplateEngine from "./template_engine"

import ExchangeRate from "./exchange-rate";
import { processCountries } from "./utility";


const MAX_SELECTABLE = 9;

class IndexController {

    constructor() {

        this.registerServiceWorker();
        this.selectedCountries = new Map();
        this.from_currency = '';
        this.to_currency = '';
        this.loadCountries().then(response => {

            // const countries = this.processCountries(json.results);
            /** idb.doesCountryDBExist().then(count => {
                 if (count !== countries.length) {
                     idb.addAll_country(countries).then(last_key => console.log(last_key));
                     this.registerServiceWorker() ;
                 }
             })**/
            response.json().then(countries => {
                console.log('in .json')
                console.log(countries)
                if (countries.results) {
                    console.log('has results')
                    const c = processCountries(countries.results);
                    this.converterConfiguration(c);
                    idb.addAll_country(c).then(key => {
                        console.log(key)
                    })
                }
                else {
                    console.log(countries);
                    this.converterConfiguration(countries);
                }
            })




        }).catch(e => console.log(e));
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').then(registration => {
                console.log(`service worker registered ${registration}`);
            }).catch(e => {
                console.log(e);
            });
        }
    }

    converterConfiguration(countries) {
        this.selectedCountries.clear();
        this.generateMarkup('Config', countries).then(markup => {
            this.appendMarkup(markup).then(main_content => {
                this.animate(main_content);
                this.addCountryClickListeners();
                this.addContinueEventListener()
            });
        }).catch(e => console.log(e));
    }

    loadCountries() {
        return this.get(this.getCurrencyConverterUrl('countries'));
    }
    get(url) {
        return fetch(url, { mode: 'cors' })
    }
    getCurrencyConverterUrl(task, query = null) {
        return ` ${query ? `https://free.currencyconverterapi.com/api/v5/${task}?q=${query}` :
            `https://free.currencyconverterapi.com/api/v5/${task}`}`

    }





    generateMarkup(template_name, data) {
        if (template_name == 'Config') {
            return new Promise((resolve, reject) => {
                const temp = TemplateEngine.generateConfig(data);
                if (temp === '')
                    reject('Template error');
                else
                    resolve(temp);

            })
        } else if (template_name === 'convert') {
            return new Promise((resolve, reject) => {
                const temp = TemplateEngine.generateConverter(data);
                if (temp === '')
                    reject('Template Error');
                else
                    resolve(temp);
            })
        }
    }

    appendMarkup(markup) {
        return new Promise((resolve, reject) => {
            const main = document.getElementById('main');
            main.innerHTML = markup;
            const main_content = document.getElementById('main_content');
            resolve(main_content);
        });

    }

    animate(main_content) {
        main_content.classList.add('animate');
    }

    addCountryClickListeners() {
        const checkboxes = document.getElementsByName('country_checkbox');
        checkboxes.forEach((element, index, list) => {


            element.addEventListener('click', event => {
                const that = event.target;

                const cid = that.dataset.countryid;
                const cur_id = that.dataset.currencyid;

                if (this.selectedCountries.size !== MAX_SELECTABLE) {
                    if (this.containsCountry(cid)) {
                        that.checked = false;
                        this.selectedCountries.delete(cid);


                    } else {
                        that.checked = true;
                        this.selectedCountries.set(cid, cur_id);

                        if (this.selectedCountries.size === MAX_SELECTABLE) {
                            this.showAlert($(that), "Maximum selectable countries reached");
                        }
                    }


                } else {

                    if (this.containsCountry(cid)) {
                        that.checked = false;
                        this.selectedCountries.delete(cid);

                    } else {
                        that.checked = false;

                    }
                }
                this.updateSelectedCount(`${this.selectedCountries.size} selection(s)   `);
            })
        })
    }
    addContinueEventListener() {
        if (this, this.selectedCountries.size === 1) {
            this.showAlert('', 'Please select more than one country');
            return;
        }
        const cont_but = document.getElementById('continue');
        cont_but.addEventListener('click', e => {
            const that = e.target;
            this.permuteSelections().then(permutations => {
                this.generateCombinedUrl(permutations).then(exchangeRateUrls => {
                    this.fetchSaveExchangeRates(exchangeRateUrls)
                })
            }).catch(e => console.log(e))

            this.getAllCountries().then(countries => {

                this.generateMarkup('convert', countries).then(markup => {

                    this.appendMarkup(markup).then(main_content => {
                        this.animate(main_content);
                        this.addChangeEventListener();
                        this.addConvertClickListener();

                    })
                })
            })
        })
    }
    containsCountry(country_id) {
        return this.selectedCountries.has(country_id);
    }

    updateSelectedCount(message) {
        const sc = document.getElementById('selectedCount');

        sc.innerText = message;

    }
    showAlert(element, message) {
        const more_msg = document.getElementById('more_msg');
        more_msg.innerText = message;
    }

    upgradeDbWithSelections() { // for removal
        idb.upgradeDbWithSelections();
    }
    getAllCountries() {


        return idb.getAllCountries();

    }



    addChangeEventListener() {
        const selects = document.getElementsByName('currency_select');
        console.log(`select count ${selects.length}`);
        selects.forEach((element, index, list) => {

            element.addEventListener('change', event => {
                const that = event.target;
                const node = (that.selectedOptions)[0];

                const nodeValue = node.value;
                console.log(`nodeval ${nodeValue}`)
                const flagUrl = node.dataset.flagurl;
                console.log(`flagurl ${flagUrl}`)
                if (nodeValue !== '') {
                    if (that.id === 'currency_from') {
                        this.from_currency = nodeValue;
                        this.addImage('from_img', flagUrl)
                    } else if (that.id === 'currency_to') {
                        this.to_currency = nodeValue;
                        this.addImage('to_img', flagUrl);
                    }
                } else if (nodeValue === '') {
                    if (that.id === 'currency_from') {
                        this.from_currency = '';
                        this.addImage('from_img', '/img/white.png')
                    } else if (that.id === 'currency_to') {
                        this.to_currency = '';
                        this.addImage('to_img', '/img/white.png');
                    }
                }

            })
        })
    }

    addImage(image_id, flagUrl) {

        const image = document.getElementById(image_id);
        console.log(`image ${flagUrl} ${image}`)
        image.src = flagUrl;
        const rate_to = document.getElementById('rate_to');
        const rate_from = document.getElementById('rate_from');
        rate_from.innerText = ' ';
        rate_to.innerText = ' ';
    }

    addConvertClickListener() {
        console.log('called')


        const but = document.getElementById('convertButton');

        but.addEventListener('click', e => {


            const inputValue = document.getElementById('amount').value;
            console.log(inputValue)
            console.log('added')
            if (inputValue === '') {
                return;
            }

            if (!isNaN(inputValue) && inputValue !== '') {
                console.log('not nan')
                const query = `${this.from_currency}_${this.to_currency}&compact=ultra`;
                const url = this.getCurrencyConverterUrl('convert', query);
                this.get(url).then(response => {
                    console.log(response)
                    response.json().then(er =>{
                        const exchangeRate = new ExchangeRate(er);
                    this.displayExchangeInfo(exchangeRate);
                    this.displayValue(exchangeRate);
                    })
                     


                })
            }
        })


    }
    displayExchangeInfo(exchangeRate) {
        const exchangeInfo_fr = `1 ${exchangeRate.fr}`;
        const exchangeInfo_to = `${exchangeRate.val.toFixed(3)} ${exchangeRate.to}`;

        const rate_from = document.getElementById('rate_from');
        const rate_to = document.getElementById('rate_to');

        rate_from.innerText = exchangeInfo_fr;
        rate_to.innerText = exchangeInfo_to;
    }
    displayValue(exchangeRate) {

        const amount = document.getElementById('amount').value;
        const value = exchangeRate.exchange(parseFloat(amount));
        const valueDisplay = document.getElementById('value');
        valueDisplay.innerText = `${exchangeRate.to} ${value.toFixed(3)}`;
    }

    /** getExchangeRate(url) {
         this.get(url).then(response => {
 
         })
     } **/



    permuteSelections() {
        return new Promise((resolve, reject) => {
            const permutations = [];
            const other_map = new Map(this.selectedCountries);

            this.selectedCountries.forEach((value, key, map) => {

                other_map.forEach((other_value, other_key, map) => {
                    if (value !== other_value)
                        permutations.push(`${value}_${other_value}`);
                })
            })

            resolve(permutations);
        })

    }

    generateCombinedUrl(permutations) {
        return new Promise((resolve, reject) => {
            const exchangeUrls = [];
            for (let x = 0; x < permutations.length; x += 2) {
                (x + 1) === permutations.length ? exchangeUrls.push(this.getCurrencyConverterUrl('convert', `${permutations[x]}&compact=ultra`)) :
                    exchangeUrls.push(this.getCurrencyConverterUrl('convert', `${permutations[x]},${permutations[x + 1]}`))

            }
            console.log(exchangeUrls);
            resolve(exchangeUrls);
        })
    }

    fetchSaveExchangeRates(exchangeUrls) {

        exchangeUrls.forEach(url => {

            this.get(url).then(response => {

                console.log(response);
            })
        })

    }


}
const ic = new IndexController();