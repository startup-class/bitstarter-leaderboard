/*
   In theory, we can trigger an action after the
   coinbase_payment_complete event fires, e.g. to replace the
   internals of the <div class="span6 offset3 order"> 
   with something other than 
   <strong><i class="icon-ok"></i> Paid</strong>
   
   Right now this event isn't firing properly on either HTTP or HTTPS pages. 
   Coinbase is fixing the bug. See documentation of intended functionality here:
   https:  coinbase.com/docs/merchant_tools/payment_buttons
   
   Once that's fixed, you can have a nicer checkout experience.
*/
$(document).ready(function() {
    $(document).on("coinbase_payment_complete", function(event, code){
	console.log("Payment completed for button: " + code);
    });
});
