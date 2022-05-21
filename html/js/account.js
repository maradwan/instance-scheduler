(function ($) {
    var authToken;
    Wild.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/index.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/index.html';
    });

	     
    // Register click handler for #request button
    $(function onDocReady() {
        $('#signOut').click(function() {
            Wild.signOut();
            window.location = "signin.html";
        });
        
    });

    $(document).ajaxError(function (event, xhr, settings, error) {
      //when there is an AJAX request and the user is not authenticated -> redirect to the login page
      if (xhr.status == 403 || xhr.status == 401) { // 403 - Forbidden
          window.location = 'signin.html';
      }
  });

    $(function () {

      $(document).on("click", "#add-button", function(e) {
      
      var items = {
     
      
     };
   
    $.ajax({
          method: 'POST',
          url: _config.api.invokeUrl + '/item',
          crossDomain: true,
          dataType: 'json',
          headers: {
                Authorization: authToken
            },
          data: JSON.stringify(items),
          contentType: 'application/json',
          success: function (){
            location.reload()
  
          },
          error: function (request, status, error) {
            alert(request.responseText);

          }
         
        });
  
      });
  

    $(document).ready(function(data){
       var gozeit_data = "";


        $.ajax({
          url: _config.api.invokeUrl + '/account',
          crossDomain: true,
          dataType: 'json',
          headers: {
            Authorization: authToken
         },
          contentType: 'application/json',
          success: function (data){

                  
                  var payment_form = document.createElement('form')
                  payment_form.id =  "payment_form"
                  //payment_form.action =  _config.api.invokeUrl + "/charge/standard"
                  //payment_form.method =  "post"
                
                  $('#payment_wrapper').append(payment_form)

                  $('#payment_form').submit(function(event) {
                    event.preventDefault()

                    $.ajax({
                      method: 'POST',
                      url: _config.api.invokeUrl + '/charge/standard',
                      crossDomain: true,
                      dataType: 'json',
                      headers: {
                        Authorization: authToken
                     },
                     data: JSON.stringify(FormData),
                      contentType: 'application/json',
                      success: function (data){


                  }
                })
              })


                 
                   
                   
               
                   
          
                
  
            $.each(data, function(){
            
              gozeit_data += `<tr>
              <td>
            
              </td>`
              gozeit_data += '<td>Account Type</td>';
              if (typeof data[0]['account_type'] != "undefined") {
              gozeit_data += '<td>'+data[0]['account_type']+'</td>';
              }

              else {

                gozeit_data += '<td>'+'Basic'+'</td>';

              }
              gozeit_data += `<tr>
              <td>`

              gozeit_data += `<tr>
              <td>`

            
             
              gozeit_data += '<td>Email</td>';
              gozeit_data += '<td>Enabled by default to '+ data[0]['email']+'</td>';
              
              gozeit_data += `<tr>
              <td>`



              gozeit_data += `<tr>
              <td>`

              gozeit_data += `<tr>
              <td>`

          
              gozeit_data += `<tr>
              <td>`
            

              gozeit_data += '<td>Webhook</td>';

              if (typeof data[0]['webhook'] != "undefined") {

              gozeit_data += '<td>'+data[0]['webhook']+'</td>';
             
              }
              
             gozeit_data += `<td>
             <a href="#editItemModal" class="edit" data-webhook="${data[0]['webhook']}" data-webhookurl="${data[0]['webhook_url']}" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i></a>
             </td>`
                     
             
             gozeit_data += '</tr>';
              
             });

         $('#myTable').append(gozeit_data);

          },
          error: function(xhr, textStatus, error) {
              console.log(xhr.responseText,items);
          }
            
      });

    });
  

 
    
    $(document).on("click", "#delete-account-button", function(e) {
 
          $.ajax({
            type: 'DELETE',
            url: _config.api.invokeUrl + '/account',
            crossDomain: true,
            dataType: 'json',
            headers: {
              Authorization: authToken
          },
            contentType: 'application/json',
            success: function (){

              Wild.signOut()
              window.location = 'signin.html';
            }
          });
        });
  
  
      $(document).on("click", ".delete", function(e) {
    
     document.querySelector('#delete-button').dataset.id = $(this).attr("data-id");
  
  
      });
  

          
  
      $(document).on('click', '.edit', function() {


        var editstatus = $(this).attr('data-webhook') 

        if ($(this).attr('data-webhookurl') != "undefined") {
        var webhookurl = $(this).attr('data-webhookurl')  
        }
         
       
        $('#editstatus').val(editstatus)
        $('#webhookurl').val(webhookurl) 


        })
      }) 
  
          $(document).on("click", "#edit-button", function(e) {
        
          var items = {
            webhook:  $('#editstatus').val() ,
            webhook_url: $('#webhookurl').val() 
          
           };
  
          
        
        $.ajax({
          type: 'PUT',
          url: _config.api.invokeUrl + '/account/webhook',
          crossDomain: true,
          dataType: 'json',
          headers: {
            Authorization: authToken
        },
          data: JSON.stringify(items),
          contentType: 'application/json',
          success: function (){
            
            location.reload()
          },
          error: function (request, status, error) {
            alert(request.responseText);

          }

          });
  
         
        });
       
        $(document).on("click", ".edit", function(e) {
              
       document.querySelector('#edit-button').dataset.id = $(this).attr("data-id");
    
      });
    
  
  
      $(document).ready(function()
      {
       // Activate tooltip
       $('[data-toggle="tooltip"]').tooltip();
       
       // Select/Deselect checkboxes
       var checkbox = $('table tbody input[type="checkbox"]');
       $("#selectAll").click(function()
       {
        if(this.checked){
         checkbox.each(function()
         {
          this.checked = true;                        
         });
        }
        else
        {
         checkbox.each(function()
         {
          this.checked = false;                        
         });
        } 
       });
       checkbox.click(function()
       {
        if(!this.checked)
        {
         $("#selectAll").prop("checked", false);
        }
       });
      });

}(jQuery));
