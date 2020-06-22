
if (localStorage["q_cat"]==null){localStorage["q_cat"]="jcr"}
if (localStorage["scihub_url"]==null){localStorage["scihub_url"]="https://sci-hub.tw/"}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("I am in background")
    switch (request.command) {
        case 'analyse_scihub':
            retry(() => analyse_scihub(request.pmid,request.doi)).then(
            function(response){
                var pdf_url=response.match(/(?<=iframe src = ").+?(?=")/)
                if (pdf_url!=null){
                    console.log(request.pmid)
                    if (pdf_url[0].startsWith("//")){pdf_url="https:" + pdf_url[0]} else{pdf_url=pdf_url[0]}
                    pdf_url=pdf_url.replace(/#view=FitH$/,"")
                    console.log(request.pmid,pdf_url)
                    sendResponse({'pdf_url':pdf_url, 'pmid':request.pmid})
                } else {
                    sendResponse({'pdf_url':"", 'pmid':request.pmid})
                }
                // $(".pdf[id="+pmids[0]+"]").attr("href",pdf_url)
            }).catch(function(err) {
                console.log("Fail connect to sci-hub server",request.pmid);
                sendResponse({'pdf_url':"", 'pmid':request.pmid});
            })
            return true;

        case 'setItem':
            console.log("prepare to setItem")
            localStorage[request.name] = request.data;
            return;
        case 'getItem':
            var retValue = localStorage[request.name];
            // console.log(localStorage);
            sendResponse(retValue);
            return;
        case 'getItems':
            let ret={}
            for (key of request.names){
                ret[key]=localStorage[key];
            };
            console.log(ret);
            sendResponse(ret);
            return;
        case 'deleteItem':
            if (typeof localStorage[request.name] !== 'undefined') {
                delete localStorage[request.name];
            }
            return;
    }
});

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log(sender.tab ?
//                 "from a content script:" + sender.tab.url :
//                 "from the extension");
//     if (request.greeting == "hello")
//       sendResponse({farewell: "goodbye"});
//   });

function analyse_scihub(pmid,doi){
    let scihub_url=localStorage["scihub_url"]+ doi
    console.log(scihub_url)
    return $.ajax({
        type: 'GET',
        url: scihub_url
        })
}

function  retry(fn, retries=3, err=null,i=1) {
  if (i>   retries) {
    console.log("retry",i)
    return Promise.reject(err);
  }
  return fn().catch(err => {
        console.log("retry",i)
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
