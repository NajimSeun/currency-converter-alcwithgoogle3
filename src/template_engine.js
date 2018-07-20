

class TemplateEngine {


  static generateConfig(countries) {

    let initialFragment = `<div class="row animation pt-5" id="main_content">
    <div class="col-md-12">
      <div class="card shadow-sm" style="margin-top: 20px">
        <div class="card-body">
          <p class="card-text font-weight-bold theme-color">Select between 2 - 10 currencies you are intrested in converting.
          </p>
           
            <div class="alert alert-success alert-dismissible fade show" role="alert">
  <strong id=selectedCount> <span>selection(s)</span></strong><span id="more_msg"></span> 
 
</div>`;

    const endFragment = `<div class="row"><div class="col-md-12 converter-form"><button class="btn  btn-submit " type="button" id="continue" >Continue</button>
    </div></div> </div></div></div></div>`;
    const initialMiddleFragment = `<div class="row"><form class="width-100"><div class="form-row">`;
    const endMiddleFragment = ` </div></form></div>`;
    let rows = [];
    let row = [];
    for (let x = 1; x <= countries.length; x++) {
      

      const country = countries[x - 1];



      const template = `
            <div class="col-md-3 mb-3">
              <div class="custom-control custom-checkbox mb-3">
                <input type="checkbox" class="custom-control-input" data-currencyid="${country.currencyId}" data-countryid="${country.id}" name="country_checkbox" id="${country.name}" >
                <img  src="${country.flagUrl}" width="30" height="30" >
                <label class="custom-control-label" for="${country.name}">${country.name} (${country.currencyId})</label>

              </div>
            </div> `;

      row.push(template)
      if (x % 4 === 0) {
        
        row.unshift(initialMiddleFragment);
        row.push(endMiddleFragment);
        
        rows.push(row.join(' '));
        row = [];
        //cons

      }
      if (x === countries.length) {
        
        rows.push(row.join(' '))
        rows.unshift(initialFragment);
        rows.push(endFragment);
      




      }
    }
    
    return rows.join(' ');
  }


  static generateConverter(countries){
    console.log(countries)
     const converter = `<div class="row justify-content-md-center" id="main_content">
     <div class="col-lg-6">


       <div class="card shadow-sm converter-card">
         <form class="converter-form p-5">
           <div class="row">
             <div class="col-md-12">
               <div class="form-logo">
                 <i class="fa fa-exchange" aria-hidden="true"></i>
               </div>
               <h3 class="form-title theme-color ">Currency Converter</h3>
             </div>
           </div>




           <div class="row">
             <div class="col-md-12">
               <div class="form-group">
                 <label for="currency_from"class = "theme-color">Convert From</label>
                 <select class="form-control" name="currency_select" id="currency_from">
                   <option value="" data-flagurl="/img/white.png" >Select Country</option>


                   ${countries.map(country => `<option value="${country.currencyId}" data-flagurl="${country.flagUrl}">${country.name}(${country.currencyId})</option>` ).join(' ')}
                 </Select>

               </div>
             </div>
           </div>
           <div class="row">
             <div class="col-md-12 ">
             <div class="form-group">
             <label for="Currency_from " class = "theme-color">Amount</label>
             <input type="number" id="amount" name="amount" placeholder="Enter Amount" class="form-control">
             </div>

             </div>
           </div>
           <div class="row">
             <div class="col-md-12">
               <div class="form-group">
                 <label for="currency_to" class= "theme-color">Convert To</label>
                 <select class="form-control" name="currency_select" id="currency_to">
                 
                   <option value="" data-flagurl="/img/white.png">Select Country</option>
                   ${countries.map(country => `<option value="${country.currencyId}" data-flagurl="${country.flagUrl}">${country.name}(${country.currencyId})</option>` ).join(' ')}
                   
                 </Select>



               </div>
             </div>
           </div>
           <div class="row">
             <div   class="col ">
               <img src="/img/white.png" width="50" height="50" id="from_img">
               </div>
               <div   class="col ">
               <a href="#">
                 <span class="  theme-color" id="rate_from"></span>
               </a>
               </div>
               <div   class="col ">
               <a href="#">
                 <i class="fa fa-exchange theme-color"></i>
               </a>
               </div>
               <div   class="col">
               <a href="#">
                 <span class="  theme-color" id="rate_to"></span>
               </a>
               </div>
               <div   class="col ">
               <img src="/img/white.png" width="50" height="50" id="to_img">
               </div>

             
           </div>
           <div class="row">
             <div class="col-md-8 offset-md-2">
               <hr>

             </div>
           </div>
           <div class="row justify-content-md-center">
             <div class="col-md-12 text-center">
               <a href="#">
                 <span class="  theme-color" id="value"></span>
               </a>

             </div>
           </div>

           <div class="row">
             <div class="col-md-12 ">
               <button type="button" class="btn btn-submit" id="convertButton">Convert</button>
             </div>
           </div>

         </form>
         <!-- form registration end -->
       </div>
        </div>
     </div>

   </div>` ;

   return converter ;
  }
}

module.exports = TemplateEngine;