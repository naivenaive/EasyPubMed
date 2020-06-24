
if (localStorage["q_cat"]==null){localStorage["q_cat"]="jcr"}
if (localStorage["scihub_url"]==null){localStorage["scihub_url"]="https://sci-hub.tw/"}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.command) {
        case 'analyse_scihub':
            retry(() => analyse_scihub(request.pmid,request.doi)).then(
            function(response){
                var pdf_url=response.match(/(?<=iframe src = ").+?(?=")/)
                if (pdf_url!=null){
                    if (pdf_url[0].startsWith("//")){pdf_url="https:" + pdf_url[0]} else{pdf_url=pdf_url[0]}
                    pdf_url=pdf_url.replace(/#view=FitH$/,"")
                    sendResponse({'pdf_url':pdf_url, 'pmid':request.pmid})
                } else {
                    sendResponse({'pdf_url':"", 'pmid':request.pmid})
                }
            }).catch(function(err) {
                sendResponse({'pdf_url':"", 'pmid':request.pmid});
            })
            return true;

        case 'setItem':
            localStorage[request.name] = request.data;
            return;
        case 'getItem':
            var retValue = localStorage[request.name];
            sendResponse(retValue);
            return;
        case 'getItems':
            let ret={}
            for (key of request.names){
                ret[key]=localStorage[key];
            };
            sendResponse(ret);
            return;
        case 'deleteItem':
            if (typeof localStorage[request.name] !== 'undefined') {
                delete localStorage[request.name];
            }
            return;
    }
});


function analyse_scihub(pmid,doi){
    let scihub_url=localStorage["scihub_url"]+ doi
    return $.ajax({
        type: 'GET',
        url: scihub_url
        })
}

function  retry(fn, retries=3, err=null,i=1) {
  if (i>   retries) {
    return Promise.reject(err);
  }
  return fn().catch(err => {
      return retry(fn, retries, err, i+1);
    });
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
