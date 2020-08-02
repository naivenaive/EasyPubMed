var manifestData = chrome.runtime.getManifest();
$("#versiontitle").text("Version "+ manifestData.version+" By Tian Zhen")

if (localStorage["q_cat"]=='jcr'){
    jcr_switch1.className='open1';jcr_switch2.className='open2';
    cas_switch1.className='close1';cas_switch2.className='close2'
} else {
    jcr_switch1.className='close1';jcr_switch2.className='close2';
    cas_switch1.className='open1';cas_switch2.className='open2'
}

$("#scihub_url")[0].value=localStorage["scihub_url"]

jcr_switch1.addEventListener("click", function () {
    jcr_switch1.className = (jcr_switch1.className == "close1") ? "open1" : "close1";
    jcr_switch2.className = (jcr_switch2.className == "close2") ? "open2" : "close2";
    cas_switch1.className = (cas_switch1.className == "close1") ? "open1" : "close1";
    cas_switch2.className = (cas_switch2.className == "close2") ? "open2" : "close2";
    chrome.runtime.sendMessage({command: 'getItem', name: 'q_cat'},function(response){
        if (jcr_switch1.className=="open1"){
            chrome.runtime.sendMessage({command: 'setItem', name: 'q_cat',data:'jcr'})
            success_prompt("Use JCR Quartile")
        } else {
            chrome.runtime.sendMessage({command: 'setItem', name: 'q_cat',data:'cas'})
            success_prompt("Use CAS Quartile")
        }
    })
});

cas_switch1.addEventListener("click", function () {
    jcr_switch1.className = (jcr_switch1.className == "close1") ? "open1" : "close1";
    jcr_switch2.className = (jcr_switch2.className == "close2") ? "open2" : "close2";
    cas_switch1.className = (cas_switch1.className == "close1") ? "open1" : "close1";
    cas_switch2.className = (cas_switch2.className == "close2") ? "open2" : "close2";
    chrome.runtime.sendMessage({command: 'getItem', name: 'q_cat'},function(response){
        if (cas_switch1.className=="open1"){
            chrome.runtime.sendMessage({command: 'setItem', name: 'q_cat',data:'cas'})
            success_prompt("Use CAS Quartile")
        } else {
            chrome.runtime.sendMessage({command: 'setItem', name: 'q_cat',data:'jcr'})
            success_prompt("Use JCR Quartile")
        }
    })
});

scihub_button.addEventListener("click", function () {
    let scihub_url = $("#scihub_url")[0].value
    // if (scihub_url.match(/https:\/\/.*\/|http:\/\/.*\//)) {
    //     chrome.runtime.sendMessage({command: 'setItem', name: 'scihub_url',data: scihub_url})
    //     success_prompt("Default Sci-Hub URL:\n"+scihub_url)
    // } else {
    //     fail_prompt("Invalid Sci-Hub URL. Valid Sci-Hub URL should start with 'https://' or 'http://' and end with ‘/’",4000)
    //     }
    // }
        if (['https://sci-hub.tw/', "https://sci-hub.st/", "https://sci-hub.se/", "https://sci-hub.ee/","https://sci-hub.ren/"].includes(scihub_url)){
            chrome.runtime.sendMessage({command: 'setItem', name: 'scihub_url',data: scihub_url})
            success_prompt("Default Sci-Hub URL:\n"+scihub_url)
        } else {
            fail_prompt("Invalid Sci-Hub URL. Valid Sci-Hub URL are https://sci-hub.tw/, https://sci-hub.st/, https://sci-hub.se/, https://sci-hub.ee/ and https://sci-hub.ren/",4000)
        }
    })

reset.addEventListener("click", function () {
    chrome.runtime.sendMessage({command: 'setItem', name: 'q_cat',data:'jcr'})
    chrome.runtime.sendMessage({command: 'setItem', name: 'scihub_url',data: 'https://sci-hub.tw/'})
    $("#scihub_url")[0].value='https://sci-hub.tw/';
    jcr_switch1.className='open1'; jcr_switch2.className='open2';
    cas_switch1.className='close1'; cas_switch2.className='close2'
    })

go_to_scihub.addEventListener("click", function () {
    $("#go_to_scihub_link").attr('href',localStorage['scihub_url']).click()
    })

pdf_button.addEventListener("click", function () {
    var for_search = $("#input_scihub")[0].value;
    if (for_search==""){
        chrome.tabs.create({ url: localStorage['scihub_url'] });
    } else {
    var method = "POST";
    action = localStorage['scihub_url'];
    form = newForm(action, method, for_search);
    $(document.body).append(form);
    form.submit();
    form.remove();
    }
})

function newForm(action, method, for_search){
    var form = $('<form></form>');
    form.attr('action', action);
    form.attr('method', method);
    form.attr('target', "_blank");
    var request = $('<input type="hidden" name="request" />');
    request.attr('value', for_search);
    form.append(request);
    return form;
}

var prompt = function (message, style, time)
{
    style = (style === undefined) ? 'ep-alert-success' : style;
    time = (time === undefined) ? 1200 : time;
    $('<div>')
        .appendTo('body')
        .addClass('ep-alert ' + style)
        .html(message)
        .show()
        .delay(time)
        .fadeOut();
};

var success_prompt = function(message, time)
{
    prompt(message, 'ep-alert-success', time);
};

var fail_prompt = function(message, time)
{
    prompt(message, 'ep-alert-danger', time);
};

// 提醒
var warning_prompt = function(message, time)
{
    prompt(message, 'ep-alert-warning', time);
};