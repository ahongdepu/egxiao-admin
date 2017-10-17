
  // 导出功能 -- 导出下载excel
  const automateExcel = function(tbody,thead,fileName) {
    let tr = function() {
      let tr_item = "";
      for(var i = 0; i < tbody.length; i++) {
        let td = function() {
          let td_item = "";
          for(var j = 0; j < thead.length; j++) {
            td_item += "<td>" + tbody[i][thead[j]] + "</td>"
          }
          return td_item;
        }();
        tr_item += "<tr>" + td + "</tr>";
      }
      return tr_item;
    }();
    let th = function() {
      let th_item = "";
      for(var i = 0; i < thead.length; i++) {
        th_item += "<th>" + thead[i] + "</th>"
      };
      return th_item
    }();
    let tableDB = "<table align='center'><thead><tr>" + th + "</tr></thead>" + "<tbody>" + tr + "</tbody></table>";
    let tableToObj = function(arg) {
      var objE = document.createElement("div");
      objE.innerHTML = arg;
      return objE.childNodes;
    };
    let tableObj = tableToObj(tableDB);
    let tableToExcel = (function() {
      let uri = 'data:application/vnd.ms-excel;base64,';
      let template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
      let base64 = function(s) {
        return window.btoa(unescape(encodeURIComponent(s)))
      };
      let format = function(s, c) {
        return s.replace(/{(\w+)}/g,
          function(m, p) {
            return c[p];
          })
      };
      return function(table, name) {
        if(!table.nodeType) table = table[0];
        var ctx = {
          worksheet: name || 'Worksheet',
          table: table.innerHTML
        }
        //						window.location.href = uri + base64(format(template, ctx))
        document.getElementById("dlink").href = uri + base64(format(template, ctx));
        document.getElementById("dlink").download = fileName + "数据.xls";
        document.getElementById("dlink").click();
      }
    })();
    tableToExcel(tableObj);
  }


  export {automateExcel}
