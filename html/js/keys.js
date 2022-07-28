(function ($) {
  var authToken = sessionStorage.getItem("authToken");
  

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
    var $profilename = $("#profilename");
    var $access = $("#access");
    var $secret = $("#secret");
    
   

    //$('#add-button').on('click', function () {
    $(document).on("click", "#add-button", function (e) {
      //console.log($notify.prop("checked"))
    
      var items = {
        name: $profilename.val(),
        access: $access.val(),
        secret: $secret.val(),
      };

      $.ajax({
        method: "POST",
        url: _config.api.invokeUrl + "/keys",
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
            gozeit_data += `<tr>
              <td>
            
              </td>`;
            gozeit_data +=
              `<td class="clsname" data-id="${data.Items[i].created}">` +
              data.Items[i].created +
              "</td>";
            gozeit_data +=
              `<td class="clsname" data-id="${data.Items[i].created}-access">` +
              data.Items[i].access +
              "</td>";
           
            // gozeit_data += '<td>'+data.Items[i].item+'</td>';
            gozeit_data += `<td>
           
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
        url: _config.api.invokeUrl + "/keys/" + $(this).attr("data-id"),
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