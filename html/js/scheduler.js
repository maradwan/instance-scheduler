(function ($) {

  const queryString = window.location.hash.substring(1) 
  const splittedQuery = queryString.split("&") 
  var query = splittedQuery.reduce((result, current) => {    
  const splitCurrent = current.split("=")
  result[splitCurrent[0]] = splitCurrent[1]
  return result
   }, {})  

  if (query.id_token) { 
    var authToken = query.id_token;
    sessionStorage.setItem("authToken", query.id_token);
  
  } else {
    authToken = sessionStorage.getItem("authToken");

  }

    // Register click handler for #request button
    $(function onDocReady() {
      $("#signOut").click(function () {
        //Wild.signOut();
        sessionStorage.removeItem("authToken");
        //alert("You have been signed out.");
        window.location = "index.html";
      });
    });
  
    $(document).ajaxError(function (event, xhr, settings, error) {
      //when there is an AJAX request and the user is not authenticated -> redirect to the login page
      if (xhr.status == 403 || xhr.status == 401) {
        // 403 - Forbidden
        window.location = "index.html";
      }
    });


  $(function () {
    var $title = $("#title");
    var $service = $("#service");
    var $provider = $("#provider");
    var $ec2id = $("#ec2id");
    var $todo = $("#todo");
    var $regi0n = $("#regi0n");
    var $notify = $("#notify");
    var $profile = $("#profile");
    var $dtime = $("#dtime");
   
    var $days = $(".days");
    
    $(document).on("click", "#addItemModal-id", function (e) {

      var profile_data = [];
      $.ajax({
        url: _config.api.invokeUrl + "/keys",
        crossDomain: true,
        dataType: "json",
        headers: {
          Authorization: authToken,
        },
        contentType: "application/json",
        success: function (data) {
            //console.log(data.Items)

            $.each(data.Items, function (i, created) {
            //  console.log(data.Items[i].created.slice(11))
             // $profile = data.Items[i].created.slice(11)
            
            profile_data += `<option value="${data.Items[i].created}">${data.Items[i].created}</option>`            
               
           
              
          })
             $("#profile").append(profile_data);
        }})
      })

    //$('#add-button').on('click', function () {
    $(document).on("click", "#add-button", function (e) {
      //console.log($notify.prop("checked"))
      var selectedDays = []
      for (day of $days) {
      
        if(day.checked){
          selectedDays.push(day.value)
        }
      }


      var items = {
        title: $title.val(),
        service: $service.val(),
        provider: $provider.val(),
        ec2id: $ec2id.val(),
        todo: $todo.val(),
        regi0n: $regi0n.val(),
        notify: `${$notify.prop("checked")}`,
        profile: $profile.val(),
        dtime: $dtime.val() + ':00' ,
        days: selectedDays
      };

      $.ajax({
        method: "POST",
        url: _config.api.invokeUrl + "/ec2",
        crossDomain: true,
        dataType: "json",
        headers: {
          Authorization: authToken,
        },
        data: JSON.stringify(items),
        contentType: "application/json",
        success: function () {
          //     console.log(items);       
         location.reload();
        
        },
        error: function (request, status, error) {
          alert(request.responseText);
        },
      });
    });
  
    $(document).ready(function (data) {
      var gozeit_data = "";

      $.ajax({
        url: _config.api.invokeUrl + "/ec2",
        crossDomain: true,
        dataType: "json",
        headers: {
          Authorization: authToken,
        },
        contentType: "application/json",
        success: function (data) {
             //console.log(data.Items)
             
            // const queryString = window.location.hash;
            // console.log(queryString.split("=")[1]);

              const queryString = window.location.hash.substring(1) 
              const splittedQuery = queryString.split("&") 
              const query = splittedQuery.reduce((result, current) => {    
              const splitCurrent = current.split("=")
              result[splitCurrent[0]] = splitCurrent[1]
              return result
               }, {})  
               console.log(query.id_token)  
             //const urlParams = new URLSearchParams(queryString);
             //const id_token = urlParams.get('id_token')
             //console.log(id_token);


            

             console.log('HELLO')

          $.each(data.Items, function (i, created) {
            gozeit_data += `<tr>
              <td>
            
              </td>`;
            gozeit_data +=
              `<td class="clsname" data-id="${data.Items[i].created}-title">` +
              data.Items[i].title +
              "</td>";
              gozeit_data +=
              `<td class="clsname" data-id="${data.Items[i].created}-provider">` +
              data.Items[i].provider +
              "</td>";

            gozeit_data +=
              `<td class="clsname" data-id="${data.Items[i].created}-service">` +
              data.Items[i].service +
              "</td>";
           

            gozeit_data +=
            `<td class="clsname" data-id="${data.Items[i].created}-ec2id">` +
            data.Items[i].ec2id +
            "</td>";
            gozeit_data +=
              `<td class="clsname" data-id="${data.Items[i].created}-regi0n">` +
              data.Items[i].regi0n +
              "</td>";
            gozeit_data +=
              `<td class="clsname" data-id="${data.Items[i].created}-profile">` +
              data.Items[i].profile  +
              "</td>";
            gozeit_data +=
              `<td class="clsname" data-id="${data.Items[i].created}-todo">` +
              data.Items[i].todo +
              "</td>";
            gozeit_data +=
            `<td class="clsname" style="display:none" data-id="${data.Items[i].created}-days">` +
            data.Items[i].days +
            "</td>";
          gozeit_data +=
          `<td class="clsname"  style="display:none"  data-id="${data.Items[i].created}-notify">` +
          data.Items[i].notify +
          "</td>";
        gozeit_data +=
              `<td class="clsname" data-id="${data.Items[i].created}-dtime">` +
              data.Items[i].dtime +
              "</td>";
            // gozeit_data += '<td>'+data.Items[i].item+'</td>';
            gozeit_data += `<td>
            <a href="#stopItemModal" class="stop" data-id="${data.Items[i].created}" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Stop the Instance">&#xe047;</i></a>
            <a href="#startItemModal" class="start" data-id="${data.Items[i].created}" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Start the Instance">&#xe038;</i></a>

             <a href="#editItemModal" id="editItemModal-id" class="edit" data-id="${data.Items[i].created}" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i></a>
             <a href="#deleteItemModal" class="delete" data-id="${data.Items[i].created}" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Delete">&#xE872;</i></a>
             `
         
            gozeit_data += "</tr>";
          });

          $("#myTable").append(gozeit_data);
        },
        error: function (xhr, textStatus, error) {
         // console.log(xhr.responseText, items);
        },
      });
    });

    $(document).on("click", "#delete-button", function (e) {
      //  $('.delete').on('click', function (e) {
      // console.log(e);

      //  var id = $(e).attr("data-id");
      //  alert($(this).attr("data-id"));

      $.ajax({
        type: "DELETE",
        url: _config.api.invokeUrl + "/ec2/" + $(this).attr("data-id"),
        crossDomain: true,
        dataType: "json",
        headers: {
          Authorization: authToken,
        },
        contentType: "application/json",
        success: function () {
          //      console.log(items);
          location.reload();
        },
      });
    });

    $(document).on("click", ".delete", function (e) {
      //  $('.delete').on('click', function (e) {
      // console.log(e);

      //  var id = $(e).attr("data-id");
      // alert($(this).attr("data-id"));

      document.querySelector("#delete-button").dataset.id = $(this).attr(
        "data-id"
      );
    });

    $(document).on("click", ".edit", function () {
 
      var edittitle = $(
        `.clsname[data-id=${$(this).attr("data-id")}-title]`
      ).text();
      var editservice = $(
        `.clsname[data-id=${$(this).attr("data-id")}-service]`
      ).text();
      var editprovider = $(
        `.clsname[data-id=${$(this).attr("data-id")}-provider]`
      ).text();
      var editec2id = $(
        `.clsname[data-id=${$(this).attr("data-id")}-ec2id]`
      ).text();
      var edittodo = $(
        `.clsname[data-id=${$(this).attr("data-id")}-todo]`
      ).text();
      var editregi0n = $(
        `.clsname[data-id=${$(this).attr("data-id")}-regi0n]`
      ).text();
      var editnotify = $(
        `.clsname[data-id=${$(this).attr("data-id")}-notify]`
      ).text();
      var editprofile = $(
        `.clsname[data-id=${$(this).attr("data-id")}-profile]`
      ).text();
      var editdtime = $(
        `.clsname[data-id=${$(this).attr("data-id")}-dtime]`
      ).text();
      var editdays = $(
        `.clsname[data-id=${$(this).attr("data-id")}-days]`
      ).text();

 
      $("#edittitle").val(edittitle);
      $("#editservice").val(editservice);
      $("#editprovider").val(editprovider);
      $("#editec2id").val(editec2id);
      $("#edittodo").val(edittodo);
      $("#editregi0n").val(editregi0n);
      $("#editnotify").val(editnotify);
      $("#editprofile").val(editprofile);
      $("#editdtime").val(editdtime.slice(0, 2));
      $("#editdays").val(editdays);
    });
  });


  $(document).on("click", "#editItemModal-id", function (e) {
    var profile_data = [];
    var $editnotify = $(
      `.clsname[data-id=${$(this).attr("data-id")}-notify]`
    ).text();
  

  if ($editnotify == 'true') {

    $(".editnotify").prop('checked', true)
    //$(':checkbox').attr('checked', true);

  } else if ($editnotify == 'false') {
    $(".editnotify").prop('checked', false)
    //$(':checkbox').attr('checked', false);

  }

   
    $.ajax({
      url: _config.api.invokeUrl + "/keys",
      crossDomain: true,
      dataType: "json",
      headers: {
        Authorization: authToken,
      },
      contentType: "application/json",
      success: function (data) {
        
        var $editdays = $("#editdays").val().split(',');
        var allDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

        for (day of allDays) {
          $(`.editdays[name='${day}']`).prop('checked', false)
           
         }
  
       for (day of $editdays) {
       $(`.editdays[name='${day}']`).prop('checked', true)
        
      }

          $.each(data.Items, function (i, created) {
          //  console.log(data.Items[i].created.slice(11))
           // $profile = data.Items[i].created.slice(11)
          // document.getElementById("profile").innerHTML = 'radwan'
          
          profile_data += `<option value="${data.Items[i].created}">${data.Items[i].created}</option>`            
             
         
            
        })
           $("#editprofile").append(profile_data);
      }
    
    })
 
    })
  
  // $('#edit-button').on('click', function () {
  $(document).on("click", "#edit-button", function (e) {
    
    var $editdays = $(".editdays");

    var editselectedDays = []
  
      for (day of $editdays) {
   
        if(day.checked){
          
          editselectedDays.push(day.value)
        }
      }
    var $editnotify = $(".editnotify");
 
    var items = {
      title: $("#edittitle").val(),
      service: $("#editservice").val(),
      provider: $("#editprovider").val(),
      ec2id: $("#editec2id").val(),
      dtime:$("#editdtime").val() + ':00',
      days: editselectedDays,
      profile: $("#editprofile").val(),
      regi0n: $("#editregi0n").val(),
      todo: $("#edittodo").val(),
      notify: `${$editnotify.prop("checked")}`,
      
    };

    $.ajax({
      type: "PUT",
      url: _config.api.invokeUrl + "/ec2/" + $(this).attr("data-id"),
      crossDomain: true,
      dataType: "json",
      headers: {
        Authorization: authToken,
      },
      data: JSON.stringify(items),
      contentType: "application/json",
      success: function () {
          // console.log(items);
        location.reload();
      },
      error: function (request, status, error) {
        alert(request.responseText);
      },
    });
  });

  $(document).on("click", ".edit", function (e) {
    //  $('.delete').on('click', function (e) {
    // console.log(e);

    //  var id = $(e).attr("data-id");
    // alert($(this).attr("data-id"));

    document.querySelector("#edit-button").dataset.id = $(this).attr(
      "data-id"
    );
  });



  $(document).on("click", ".start", function () {
 

    var ec2id = $(
      `.clsname[data-id=${$(this).attr("data-id")}-ec2id]`
    ).text();

    var service = $(
      `.clsname[data-id=${$(this).attr("data-id")}-service]`
    ).text();
   
    var regi0n = $(
      `.clsname[data-id=${$(this).attr("data-id")}-regi0n]`
    ).text();
   
    var profile = $(
      `.clsname[data-id=${$(this).attr("data-id")}-profile]`
    ).text();
   
    
    $("#ec2id").val(ec2id);
    $("#service").val(service);
    $("#regi0n").val(regi0n);
    $("#profile").val(profile);
   
    document.getElementById("ec2instance-start").innerHTML = $("#ec2id").val();
    document.getElementById("profile-value-start").innerHTML = profile;
 
  });
 

  // $('#edit-button').on('click', function () {
    $(document).on("click", "#start-button", function (e) {
   // console.log($(this).attr("data-id")-days)  
      
      var items = {
        ec2id: $("#ec2id").val(),
        service: $("#service").val(),
        profile: 'ec2profile_' + $('#profile-value-start').text(),
        regi0n: $("#regi0n").val(),
        todo: 'start',
        
      };
  
      $.ajax({
        type: "POST",
        url: _config.api.invokeUrl + "/ec2/action",
        crossDomain: true,
        dataType: "json",
        headers: {
          Authorization: authToken,
        },
        data: JSON.stringify(items),
        contentType: "application/json",
        success: function (res) {
            // console.log(items);
            alert(`Current State: ${res.CurrentState} \n\nPrevious State: ${res.PreviousState}`)
          location.reload();
        },
        error: function (request, status, error) {
          alert(request.responseText);
        },
      });
    });
  

    
  
  
    $(document).on("click", ".stop", function () {
   
  
      var ec2id = $(
        `.clsname[data-id=${$(this).attr("data-id")}-ec2id]`
      ).text();

      var service = $(
        `.clsname[data-id=${$(this).attr("data-id")}-service]`
      ).text();
     
      var regi0n = $(
        `.clsname[data-id=${$(this).attr("data-id")}-regi0n]`
      ).text();
     
      var profile = $(
        `.clsname[data-id=${$(this).attr("data-id")}-profile]`
      ).text();
     
      
      $("#ec2id").val(ec2id);
      $("#service").val(service);
      $("#regi0n").val(regi0n);
      $("#profile").val(profile);

      document.getElementById("ec2instance-stop").innerHTML = $("#ec2id").val();
      document.getElementById("profile-value-stop").innerHTML = profile;

     
    });
   
  
    // $('#edit-button').on('click', function () {
      $(document).on("click", "#stop-button", function (e) {
     // console.log($(this).attr("data-id")-days)  
        
        var items = {
          ec2id: $("#ec2id").val(),
          service: $("#service").val(),
          profile: 'ec2profile_' + $('#profile-value-stop').text(),
          regi0n: $("#regi0n").val(),
          todo: 'stop',
          
        };
    
        $.ajax({
          type: "POST",
          url: _config.api.invokeUrl + "/ec2/action",
          crossDomain: true,
          dataType: "json",
          headers: {
            Authorization: authToken,
          },
          data: JSON.stringify(items),
          contentType: "application/json",
          success: function (res) {
              // console.log(items);
            alert(`Current State: ${res.CurrentState} \n\nPrevious State: ${res.PreviousState}`)
          location.reload();
          },
          error: function (request, status, error) {
            alert(request.responseText);
          },
        });
      });
 
 
  $(function() {
    $("#exporttable").on('click', function() {
      var data = "";
      var tableData = [];
      var rows = $("table tr");
      rows.each(function(index, row) {
        var rowData = [];
        $(row).find("th, td").each(function(index, column) {
          rowData.push(column.innerText);
        });
        tableData.push(rowData.join(","));
      });
      data += tableData.join("\n");
      $(document.body).append('<a id="download-link" download="data.csv" href=' + URL.createObjectURL(new Blob([data], {
        type: "text/csv"
      })) + '/>');
  
  
      $('#download-link')[0].click();
      $('#download-link').remove();
    });
  });


  $(document).ready(function () {
    // Activate tooltip
    $('[data-toggle="tooltip"]').tooltip();

    // Select/Deselect checkboxes
    var checkbox = $('table tbody input[type="checkbox"]');
    $("#selectAll").click(function () {
      if (this.checked) {
        checkbox.each(function () {
          this.checked = true;
        });
      } else {
        checkbox.each(function () {
          this.checked = false;
        });
      }
    });
    checkbox.click(function () {
      if (!this.checked) {
        $("#selectAll").prop("checked", false);
      }
    });
  });
  
})(jQuery);


function copyToClipboard() {

  var x = document.getElementById("notify-to-copy");
  if (x.innerText !== "Link Copied") {
    x.innerHTML = "Link Copied";
    
  } else {
    x.innerHTML = "";
  }
    const str = document.getElementById('item-to-copy').href;

const el = document.createElement('textarea');
 el.value = str;
 el.setAttribute('readonly', '');
 el.style.position = 'absolute';
 el.style.left = '-9999px';
 document.body.appendChild(el);
 el.select();
 document.execCommand('copy');
 document.body.removeChild(el);
 location.reload();
}

function mySearchFunction() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }
}