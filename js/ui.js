function endSession(){
  ls.clearStorage()
}
window.onbeforeunload = function() {
  endSession();
 }


function changeCurrentWallet(){

 //$.confirm('');
  $.confirm({
      title: 'Change the wallet?',
      content: '',
      buttons: {
          confirm:{
            text: 'Ok',
            btnClass: 'btn-success',
            //keys: ['enter', 'shift'],
            action: function () {
             var wallet = ls.getWallet()
             localStorage.removeItem("wallet")
             localStorage.removeItem("ethAddress")

             $(".walletSelection").show()
             $(".currentWallet." + wallet).fadeOut()
             $("#" + wallet).hide()
             $("#txInfo").hide()


             $("#notAuthorized").hide()

             //if(!localStorage.getItem("ethAddress")){
               $("#ethAddressCheck").hide()
               $("#ethAddressSelected").hide()
               $("#ethAddress input").val("")
               $("textarea.data").val("")
               $(".txInfo").hide()
               $(".err").hide()
               $(".ok").hide()
               $("#coincrowdQR_box").hide()
               $(".claimAlredyDone").hide()
               $(".noPartecipationInTokenSale").hide()





             //}
           }
          },
          cancel: {
            text: 'Cancel',
            btnClass: 'btn-warning',
            //keys: ['enter', 'shift'],
            action: function(){
                return;
            }
        }
      }
  });


}


function showTxInfo(){
  $("#notAuthorized").hide()
  $("#walletSelectionBox").show()
  $( "a" ).focus();
  $("#kycNote").hide()
  $("#ethAddressCheck").hide()

  $(".claimTokenWithMetamask").hide()

  localStorage.setItem("ethAddress", $('#ethAddress input').val());



  if(localStorage.getItem("wallet")=="metamask"){
    console.log('%c showTxInfo! ', 'background: green; color: #ffffff; font-size:21px;');
    console.log("wallet");
    console.log(localStorage.getItem("wallet"));
    $(".claimTokenWithMetamask").show()
  }


  if(localStorage.getItem("wallet")=="coincrowd"){
    $("#coincrowdQR_box").show()
    setCoinCrowdQr()
  }

  if(localStorage.getItem("wallet")=="other"){
    $(".txInfo").show()
  }


}



function step2(authorized){
  $(".txInfo").hide()
  $("#coincrowdQR_box").hide()
  $(".claimAlredyDone").hide()
  $(".noPartecipationInTokenSale").hide()
  $(".err").hide()
  $(".ok").hide()

  if(authorized){
    //Check the balance
    if(!contract){
      var contract = web3.eth.contract(contractAbi);
    }
    var RCcontract = contract.at(contractAddress);


    var ethAddress = $("#ethAddress input").val()

    RCcontract.userBalance(ethAddress, function(e,r){
      //console.log("e,r"); console.log(e,r);
      if(e){
        console.log("--------- Error ---------");
        console.log(e);
      }
      if(r){
        if(r[0].e != 0 ){
          showTxInfo()
        }
        else if(r[0].e == 0 && r[1].e != 0 ){
          $(".claimAlredyDone").show()
          //showClaimAlredyDone()
          //alert("Hai gia fatto il claim! ")
        }
        else{
          $(".noPartecipationInTokenSale").show()
          //showNoPartecipationInTokenSale()
          //alert("NON HAI PARTECIPATO !!! ")
        }
        //
        //Show TX info only if balance is present and not yet claimed
        //
      }
    })







  }else{
    console.log("NOT Authorized !!!");
    localStorage.removeItem("ethAddress")
    $( "a" ).focus();
    $("#notAuthorized").show()
    $("#kycNote").show()
    $("#ethAddressCheck").show()
    $("#ethAddressSelected").hide()

    $("#coincrowdQR_box").hide()
    //
  }
}





function setCoinCrowdQr(eth,data){
  var ethAddress = $("#ethAddress input").val()
  var data = $("textarea.data").val() // TODO get from API IcoEngine


  CoinCrowdQR({
    address: contractAddress,
    value: eth,
    gas: 250000,
    data: data
  })
}


function checkKyc(){
  var urlIcoEngine = "https://eidoo-api-1.eidoo.io/api/ico/" + contractAddress + "/authorization/" + $('#ethAddress input').val() + "/tier1"
  //var urlIcoEngine = "https://eidoo-api-1.eidoo.io/api/ico/" + contractAddress + "/authorization/" + $('#ethAddress input').val()

  //var urlIcoEngine = "icoEngineFakeResponse.json"
  console.log("url", urlIcoEngine);

  //$("#scanEtherAddress").html('Get the qr code to send TX');
  if(!web3.isAddress($("#ethAddress input").val())){
    console.log("Address not valid");
    $("#ethAddress .ok").hide()
    $("#ethAddress .err").show()
    $("#notAuthorized").hide()

  }else{
    //Address is correct!
    $("#ethAddress .err").hide()
    $("#ethAddress .ok").show()

    //Call the IcoEngine API
    $(".overlay").show()
    $.ajax({
      url: urlIcoEngine,
      cache: false,
      success: function(result){
        $(".overlay").hide()
        console.log("urlIcoEngine");
        console.log(urlIcoEngine);
        console.log("---------> result");
        console.log(result);
        if(result && result.authorized){
          //Ethereum address is authorized
          $("textarea.data").val(result.authorizationToken)
          step2(true)
        }else{
          step2(false)
        }
      }
    });

  }
}





$(function() {
  if(rcs.indexOf(contractAddress) <0){
    //
    alert("This is not a correct address");
    $("#rcNotCorrect").show()

  }else{
    console.log("rcNotCorrect hide");
    $("#rcNotCorrect").hide()
  }

  


  $('#ethAddress input').on('keyup input propertychange paste change', function(e) {
    //var wallet = ls.getWallet()
    $('#ethAddress input').val($('#ethAddress input').val().trim())
    checkKyc()

  });


  $(".claimTokenWithMetamask").on("click", function(e){
    //var contractAddress_ = contractAddress
    var contractAddress_switch = contractAddressZero

    var transactionObject = {
      from: $('#ethAddress input').val(),
      to: contractAddress_switch,
      value: 0,
      gas: 250000,
      data: $("textarea.data").val()
    };

    console.log("transactionObject");
    console.log(transactionObject);
    web3.eth.sendTransaction(transactionObject, function(a,b){ console.log(a,b); } )

  });

  $("#changeEthAddress").on("click", function(e){
    e.preventDefault()
    localStorage.removeItem("ethAddress")
    $('#ethAddress input').val("")
    $("#ethAddressSelected").hide()
    $("#notAuthorized").show()
    $("#walletSelectionBox").hide()
    $("#kycNote").show()
    $("#ethAddressCheck").show()

    $("#ethAddress .ok").hide()
    $("#ethAddress .err").hide()
    $("#notAuthorized").hide()

    $("#txInfo").hide()

  });

  $(".changeCurrentWallet").on("click", function(){
    changeCurrentWallet()
  });

  $(".copyToClip").click(function(e){
    e.preventDefault();
    $("textarea.data").select();
    document.execCommand('copy');
  });

});
