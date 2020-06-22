
//2515-4184
// var pmids=[]
// var bibs={}
// var modal
// var bibtexButton 
// var closeButton 
// var downloadButton 
// var copyButton 
// var scihub_url 
// var q_cat 

// chrome.storage.local.get(['scihub_url'], function(result) {
//     scihub_url=result
// });
// chrome.storage.local.get(['q_cat'], function(result) {
//     q_cat=result
// });
// var q_cat
// chrome.runtime.sendMessage({command: 'getItem', name: 'q_cat'},function(response){
//     q_cat=response
// })
// console.log('aaaaa',q_cat)

// console.log("start")

// const jcr_sci_url = chrome.runtime.getURL('data/jcr_sci.xml')
const modal_url = chrome.runtime.getURL('script/modal.js')
const style_url = chrome.runtime.getURL('css/style.css')
const jcr_sci_url = chrome.runtime.getURL('data/imfqb_pubmed_abbv.json')

// const jcr_sci_url="http://localhost:5500/data/jcr_sci.xml"
// var jcr_sci = get_jcr_sci()
// console.log(jcr_sci_url,modal_url,style_url)

// console.log('teeee',localStorage['q_cat'],localStorage['scihub_url'])
var pmids=[]
var bibs={}
var modal
var bibtexButton 
var closeButton 
var downloadButton 
var copyButton 

getItem('q_cat')
getItem('scihub_url')
main()

// chrome.runtime.sendMessage({ command: 'getItems', names: ['q_cat','scihub_url'] }, function(response) {
//         console.log(response);
//         for (var key in response){
//             window.localStorage[key] = response[key];
//         }
//         main()
//     });

console.log("end")

function main(){
    if(location.hostname=='pubmed.ncbi.nlm.nih.gov'){
        if (location.pathname.match(/\/\d+/)){
            var insert_html
            pmids.push($(".current-id")[0].textContent);
            let pmid =pmids[0];
            bibs[pmid]= {"Journal_get":$("meta[name='citation_publisher']").attr("content"),
                            "doi_get":$("meta[name='citation_doi']").attr("content")}
            bibs = core_analyse_imfq(bibs)
            insert_html = create_insert_html(pmid,bibs[pmid])
            $(".abstract[id='abstract']").append(insert_html);

            get_scihub_pdf(pmids,bibs)
            retry(() => get_pubmedxml(pmids)).then(
                function(pubmedxmls){
                    bibs = core_analyse_pubmed(bibs,pubmedxmls)
                    console.log("bibs",bibs)
                    $("p[id="+pmid+"]").text(bibs[pmid]["bibtex"]);
                    $(".bibtex-button[id="+pmid+"]").text("View BibTex").css('color','#20558a').css('cursor','pointer')
                    renew_listener()
                }).catch(function(err) {
                fail_prompt("Fail connect to bibtex server");
                $(".bibtex-button[id="+pmid+"]").text("Failed to get BibTex")
            })
            
            //analyse_scihub(pmids[0])
                    
        }
        if (location.href.match(/https:\/\/pubmed.ncbi.nlm.nih.gov\/\?term=/)){
            // let start=Date.now()
            pmids = $(".search-results-chunk.results-chunk").attr("data-chunk-ids").split(",")
            let search_page = $(".search-results-chunk.results-chunk").attr("data-page-number")
            let journals=$(".labs-docsum-journal-citation.full-journal-citation").map(function(){
                let x = $(this).text().match(/^[^.]*/);
                if (x==null) {return ""} else {return x};
            }).get()
            let dois=$(".labs-docsum-journal-citation.full-journal-citation").map(function(){
                let x=$(this).text().match(/(?<=doi: ).*(?=\. )|(?<=doi: ).*(?=\.$)/); 
                if (x==null) {return ""} else {return x};
            }).get()
            for (var i=0; i<pmids.length; i++){
                bibs[pmids[i]]= {"Journal_get":journals[i],"search_page":search_page,"doi_get":dois[i],"pos":i+1}
            }
            bibs = core_analyse_imfq(bibs)
            console.log(search_page,bibs)

            for (var i=0; i<pmids.length; i++){
                let insert_html = create_insert_html(pmids[i],bibs[pmids[i]])
                let pmid=pmids[i]
                $(".search-results-chunk[data-page-number="+bibs[pmid]["search_page"]+"] article[data-rel-pos="+bibs[pmid]["pos"]+"]").append(insert_html);
            }
            // console.log("insert_time",Date.now()-start)

            get_scihub_pdf(pmids,bibs)

            retry(() => get_pubmedxml(pmids)).then(
                function(pubmedxmls){
                    bibs = core_analyse_pubmed(bibs,pubmedxmls)
                    console.log("bibs",bibs)
                    for (var i=0; i<pmids.length; i++){
                        let pmid=pmids[i]
                        $("p[id="+pmid+"]").text(bibs[pmid]["bibtex"]);
                        $(".bibtex-button[id="+pmid+"]").text("View BibTex").css('color','#20558a').css('cursor','pointer')
                    }
                    renew_listener()
                }).catch(function(err) {
                fail_prompt("Fail connect to bibtex server")
                for (var i=0; i<pmids.length; i++){
                    let pmid=pmids[i]
                    $(".bibtex-button[id="+pmid+"]").text("Failed to get BibTex")
                }
            })
            // console.log("first load 2",Date.now()-start)

            var mo=new MutationObserver(function(mutations){
                // console.log(1,mutations)
                mutations.forEach(mo_callback)
            })
            mo.observe(document.body.getElementsByClassName("search-results-chunks")[0],{childList:true})
        }
    }
}

function getItems(names){
    chrome.runtime.sendMessage({ command: 'getItems', name: names }, function(response) {
        // console.log(response);
        window.localStorage[name] = response;
    });
}

function getItem(name) {
    chrome.runtime.sendMessage({ command: 'getItem', name: name }, function(response) {
        // console.log(response);
        window.localStorage[name] = response;
    });
}

function mo_callback(mutation){
//callback for new pubmed "more results"
    let start=Date.now()
    new_pmids = $(mutation.addedNodes).attr("data-chunk-ids").split(",")

    let search_page = $(mutation.addedNodes).attr("data-page-number")
    let journals=$(".labs-docsum-journal-citation.full-journal-citation",mutation.addedNodes[0]).map(function(){
        let x = $(this).text().match(/^[^.]*/);
        if (x==null) {return ""} else {return x};
        }).get()
    let dois=$(".labs-docsum-journal-citation.full-journal-citation",mutation.addedNodes[0]).map(function(){
        let x=$(this).text().match(/(?<=doi: ).*(?=\. )|(?<=doi: ).*(?=\.$)/); 
        if (x==null) {return ""} else {return x};
        }).get()

    new_bibs={}

    for (var i=0; i<new_pmids.length; i++){
        new_bibs[new_pmids[i]]= {"Journal_get":journals[i],"search_page":search_page,"doi_get":dois[i],"pos":i+1}
    }

    new_bibs = core_analyse_imfq(new_bibs)

    // console.log(search_page,new_bibs)

    for (var i=0; i<new_pmids.length; i++){
        let insert_html = create_insert_html(new_pmids[i],new_bibs[new_pmids[i]])
        let pmid=new_pmids[i]
        $(".search-results-chunk[data-page-number="+new_bibs[pmid]["search_page"]+"] article[data-rel-pos="+new_bibs[pmid]["pos"]+"]").append(insert_html);
    }
    // console.log("callback",Date.now()-start)

    get_scihub_pdf(new_pmids,new_bibs)

    retry(() => get_pubmedxml(new_pmids)).then(
    function(pubmedxmls){
        new_bibs = core_analyse_pubmed(new_bibs,pubmedxmls)
        bibs = {...bibs,...new_bibs}
        for (var i=0; i<new_pmids.length; i++){
            let pmid=new_pmids[i]
            $("p[id="+pmid+"]").text(bibs[pmid]["bibtex"]);
            $(".bibtex-button[id="+pmid+"]").text("View BibTex").css('color','#20558a').css('cursor','pointer')
        }
        renew_listener()
    }).catch(function(err) {
                fail_prompt("Fail connect to bibtex server")
            for (var i=0; i<new_pmids.length; i++){
                let pmid=new_pmids[i]
                $(".bibtex-button[id="+pmid+"]").text("Failed to get BibTex")
        }
    })
    // console.log("callback",Date.now()-start)
}

function renew_listener(){
// renew listeners     
    modal = $(".modal");
    bibtexButton = $(".bibtex-button");
    closeButton = $(".close-button");
    downloadButton = $(".modal-button:contains('Download BibTex')");
    copyButton = $(".modal-button:contains('Copy to Clipboard')"); 

    for (var i=0; i<modal.length; i++){
        bibtexButton[i].addEventListener("click", toggleModal);
        closeButton[i].addEventListener("click", toggleModal);
        window.addEventListener("click", windowOnClick);
        downloadButton[i].addEventListener("click", downloadOnClick);
        copyButton[i].addEventListener("click", copyOnClick)
    }
}

function get_scihub_pdf(pmids,bibs){
//analyse sci_hub_url and extract the corresponding pdf_url, activate the pdf link
    for (var i=0; i<pmids.length; i++){
        if (bibs[pmids[i]]["doi_get"]!=""){
            chrome.runtime.sendMessage({command:'analyse_scihub', pmid:pmids[i], doi:bibs[pmids[i]]["doi_get"]},
            function(response){
                // console.log(response)
                if (response.pdf_url!=""){
                    $(".pdf[id="+response.pmid+"]").attr("href",response.pdf_url).text("PDF(Full Text)").css('color','#20558a')
                } else {
                    $(".pdf[id="+response.pmid+"]").text("PDF(NOT FOUND)")
                }
            })
        } else {
            $(".pdf[id="+pmids[i]+"]").text("PDF(NOT FOUND)")
        }
    }
}

function get_jcr_sci(){
//load jcr_sci.xml file
    let start=Date.now()
    var ret    
    $.ajax({
        type: 'GET',
        url: jcr_sci_url,
        dataType:'JSON',
        tryCount : 0,
        retryLimit : 3,
        async: false,
        success: function(s){
            ret=s
        },
        error: function(xhr, textStatus, errorThrown ) {
            this.tryCount++;
            if (this.tryCount <= this.retryLimit) {
                //try again
                $.ajax(this);
                return;
            };
            pubmedxml=0;          
            return}
        })
    console.log("get jcr_sci use",(Date.now() - start)/1000)
    return ret
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

function get_pubmedxml(pmid){
    /*get_pubmedxml support obtaning multiple pmid each time
Use ajax with 3 try times at most
Return a xml file with multiple aritcle data as a whole*/
    let pubmedxml
    let pmids
    if (pmid.length==1){
        pmids=pmid
    } else {
        pmids=pmid.join(",")
    }
    let efetch = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id="+ pmids +'&rettype=abstract';
    console.log("start get")
    return $.ajax({
        type: 'GET',
        url: efetch,
        dataType:'XML',
        })
}

function analyse_pmbmedxml(pmid,pubmedxml){
    /*analyse pmid with pubmedxml one in each time and return bib and bibtex format
bib is a named array with Author in x*2 dimension with lastname[0] and firstname[1]
bibtex is bibtex formatted data
*/
    var bib = {}
    var bibtex=''
    bib['PMID_analyse'] = $("MedlineCitation PMID",pubmedxml);
    bib['Title'] = $("MedlineCitation Article ArticleTitle",pubmedxml);
    bib['Journal'] = $("MedlineCitation MedlineJournalInfo MedlineTA",pubmedxml) //,MedlineCitation Article Journal ISOAbbreviation
    bib['Journal_full'] = $("MedlineCitation Article Journal Title",pubmedxml)
    bib['Abstract'] = $("MedlineCitation Article Abstract AbstractText",pubmedxml)
    bib['Volume'] = $("MedlineCitation Article Journal JournalIssue Volume",pubmedxml)
    bib['Issue'] = $("MedlineCitation Article Journal JournalIssue Issue",pubmedxml)
    bib['Year'] = $("MedlineCitation Article Journal JournalIssue PubDate Year, MedlineCitation Article Journal JournalIssue PubDate MedlineDate",pubmedxml)
    bib['Month'] = $("MedlineCitation Article Journal JournalIssue PubDate Month",pubmedxml)
    bib['doi'] = $("MedlineCitation Article ELocationID[EIdType='doi'],ArticleIdList ArticleId[IdType='doi']",pubmedxml)
    bib['Pages'] = $("MedlineCitation Article Pagination MedlinePgn",pubmedxml)
    for (var key in bib){
        if (bib[key].length==0){
            bib[key]=""
        } else {
            bib[key]=bib[key][0].textContent
        }
    }
    
    let names=[]
    if ($("Author",pubmedxml).length>0){
        var i
        for (i=0;i<$("Author",pubmedxml).length;i++){
            var lastname, firstname
            var name = {}
            lastname = $("LastName",$("Author",pubmedxml)[i])
            firstname = $("ForeName",$("Author",pubmedxml)[i])
            if (lastname.length==1){
                name["lastname"]=lastname[0].textContent
            } else {
                name["lastname"]=""
            }
            if (firstname.length==1){
                name["firstname"]=firstname[0].textContent
            } else {
                name["firstname"]=""
            }
            names[i]=name
        }
    }
    if (names == undefined||names.length==0||names[0]==undefined){
        names=[{lastname:"",firstname:""}]
    }
    bib["Author"]=names
    bib['PMID'] = pmid
    let efetch = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id="+ pmid +'&rettype=abstract';
    bib["efetch"]=efetch
    bib['filename'] = `PMID${bib['PMID_analyse']}_${bib['Author'][0]["lastname"]}_${bib['Year']}`
    //console.log(bib)
    bibtex += `@Article{PMID${bib['PMID_analyse']}_${bib['Author'][0]["lastname"]}_${bib['Year']},\n`
    for ( key of ['Title','Author','Journal','Year','Volume','Issue','Pages','doi']){
        if (key=="Author"){
            bibtex += 'Author={'+bib['Author'].map(e => Object.values(e).join(', ')).join(' AND ')+"},\n"
            continue
        }
        if (bib[key]!=""){
            bibtex+=`${key}={${bib[key]}},\n`
        }
    }
    bibtex+="}"
    //console.log(bibtex)
    bib["bibtex"]=bibtex
    return {"bib": bib}
}

function get_pmid_imfq(pmid,bib,jcr_sci){
//get imfq if cant find both, both return as -1
    let temp
    let imfq={}
    imfq["pmid_imfq"]=pmid
    imfq["imf"]="NA"
    imfq["q"]="NA"
    temp = jcr_sci.filter(function(x){return x.journal==bib["Journal_get"]})//.replace(/\./g,"")
    if (temp.length!=0){
        imfq["imf"] = temp[0].IF;
        if (localStorage["q_cat"]=='jcr'){
            imfq["q"]= temp[0].Q;
        } else {
            imfq["q"]= temp[0].B
        }
    }
    // JOURNAL_FULL = bib['Journal_full']
    // JOURNAL_FULL =JOURNAL_FULL.toUpperCase().replace(",","").replace(/^THE /,"");
    // temp = $("TITLE",jcr_sci).filter(function() {
    //     return $(this).text() === JOURNAL_FULL}).siblings();//:contains("+ JOURNAL_FULL +")
    // if (temp.length==2){
    //     imfq["imf"] = temp[0].textContent;
    //     imfq["q"]= temp[1].textContent;
    // } 
    return imfq
}

function core_analyse_pubmed(bibs,pubmedxmls){
//input pmids  return bibs with bibs[pmid]=[bib:[imf:,q:,pmid:,...],bibtex]
    var i
    // var bibs={}
    for (i=0; i<$("PubmedArticle",pubmedxmls).length; i++) {
        // let pubmedxml
        let pubmedxml = $("PubmedArticle",pubmedxmls)[i];
        let pmid = $("MedlineCitation PMID",pubmedxml)[0].textContent;
        let temp = analyse_pmbmedxml(pmid,pubmedxml)
        Object.assign(bibs[pmid],temp['bib'])
    }
    return bibs
}

function core_analyse_imfq(bibs){
    let start = Date.now();
    let id=Object.keys(bibs)
    var jcr_sci
    jcr_sci= get_jcr_sci()
    for (var i=0; i<id.length; i++){
        Object.assign(bibs[id[i]], get_pmid_imfq(id[i],bibs[id[i]],jcr_sci))
        
    }
    console.log("get imfq analyse use",(Date.now() - start)/1000)
    return bibs
    // let id=len(bibs)["id"]
    // var i=0
    // for (i=0; i<len(bibs)["l"]; i++) {
    //     Object.assign(bibs[id[i]]['bib'], get_pmid_imfq(id[i],bibs[id[i]]["bib"]))
    // }
}

function create_insert_html(pmid,bib){
    if (bib==undefined){
        return ""
    } else {
    var html = "<style>@import url('"+style_url+"')</style>"
    html += "<div class='ep-impactfactor-container' id="+pmid+">\
            "
    html += "<dd style='margin-left:30px'>\
                <a style='color:#20558a !important;margin-top: 7.5px' title='Easy Pubmed' href='https://www.github.com'>\
                <img src='"+chrome.extension.getURL("images/ep_25.png")+"'></a>\
            </dd>";
    switch (bib["q"]){
        case "B1":
        case "Q1":
            html += "<dd style='background-color:rgba(255, 0, 0, 0.75) !important'>"+bib["q"]+"</dd>";break;
        case "B2":
        case "Q2":
            html += "<dd style='background-color:rgba(255, 255, 0, 0.8) !important'>"+bib["q"]+"</dd>";break;
        case "B3":
        case "Q3":
            html += "<dd style='background-color:rgba(0, 255, 0, 0.8) !important'>"+bib["q"]+"</dd>";break;
        case "B4":
        case "Q4":
            html += "<dd style='background-color:rgba(105, 105, 105, 0.5) !important'>"+bib["q"]+"</dd>";break;
        case "NA":
            html += "<dd style='background-color:#f3f9d2 !important'>"+bib["q"]+"</dd>";break;
    }
    html += "<dd>Impact Factor: "+bib["imf"]+"</dd>";
    // html += "<dd><a style='color:grey' target='_blank' id='"+pmid+"'>Loading PDF Address...</a></dd>";
    if (bib["doi_get"]!=""){
        html += "<dd><a class='scihub_link', id="+pmid+" target='_blank' href='"+localStorage["scihub_url"]+bib["doi_get"]+"'>Link to Sci-Hub</a></dd>";
    } else {
        html += "<dd style='color:grey'>Link to Sci-Hub</dd>"
    }
    html += '<dd><a class="pdf" id='+pmid+' style="color:grey" target="_blank">Loading PDF...</a></dd>'
    html += '<dd class="bibtex-button" id='+pmid+' style="color:grey">Loading Bibtex...</dd>'
    html += '<div class="modal" id='+pmid+'>\
                <div class="modal-content" id='+pmid+'>\
                    <span class="close-button" id='+pmid+'>×</span>\
                    <h1 style="margin-top:0.5em;margin-bottom:0.25em">BIBTEX</h1>\
                    <hr />\
                    <p style="white-space: pre-line" id='+pmid+'></p>\
                    <button class="modal-button" id='+pmid+'>Download BibTex</button>\
                    <button class="modal-button" id='+pmid+'>Copy to Clipboard</button>\
                </div>\
            </div>';
    html += "</div>";
    return html}
}


//relate to background.js
function setItem(name, data) {
    chrome.runtime.sendMessage({ command: 'setItem', name: name, data: data });
}


//modal related function
function toggleModal(event) {
    modal.filter(function() {
        return $(this).attr("id") === event.target.id})[0].classList.toggle("show-modal");
}

function windowOnClick(event) {
    if (event.target.className==="modal show-modal") {
        toggleModal(event);
    }
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function downloadOnClick(event){
    download("bibtex_"+bibs[event.target.id]["filename"]+".txt",bibs[event.target.id]["bibtex"]); 
}

function copytoClip(content){
    var aux = document.createElement("input");
    aux.setAttribute("value",content);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
    success_prompt("Success copy bibtex to clipboard");
}

function copyOnClick(event){
    copytoClip(bibs[event.target.id]["bibtex"])
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

//Unused function
// function len(bibs){
//     var l=0 
//     var id=[]
//     for (i=0; i<bibs.length;i++){if (bibs[i]!=undefined){l++;id.push(i)}}
//     return {"l":l,"id":id}
// }

//GARBAGE

/*<p style="white-space: pre-line">' + bib["bibtex"] + '</p>\*/

// pmids = ['30293440','30566553',14985485,'aaaaaa']
// x[14985483]["bib"]["Journal_full"]="New England journal of medicine"
// bibs = core_analyse_pubmed(pmids)
// bibs[14985485]["bib"]["Journal_full"]="New England journal of medicine"
// bibs = core_analyse_imfq(bibs)

// var insert_html
// insert_html = create_insert_html(pmids[0],bibs[pmids[0]])
// $(".heading[id='heading']").append(insert_html);
// $(".abstract[id='abstract']").append(insert_html);
// insert_html = create_insert_html(pmids[3],bibs[pmids[3]])
// document.write(insert_html);
// insert_html = create_insert_html(pmids[2],bibs[pmids[2]])
// document.write(insert_html);
// $(".heading[id='heading']").append("<script src='"+modal_url+"'></script>")

//console.log(x)



// html += "<a class='ep-impactfactor-citation' href='#' data-id='2'>Bibtex</a>";
// html +="</dd><dt>Cited:</dt><dd class='cited-num' data-pmid='1'>";
//html += "<img src='"+chrome.extension.getURL("images/view19.png")+"'>";
// if(pmid in scihub){
//     html += "<dd><a target='_blank' href='"+serverURL+scihub[pmid]+"'>Full Text(PDF)</a></dd>";
// }else{
//     html += "<dd><span class='pmid-sci-hub' data-pmid='"+pmid+"'>Full Text(PDF)</span></dd>";
// }
// var efetch = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id='+ pmid +'&rettype=abstract';
// var xml
// xml=httpGet(efetch)
// var res
// res=$.ajax({
//         type: 'GET',
//         url: efetch,
//         dataType:'XML',
//         success: function(r){console.log(r)},
//         error: function(e){console.log(`error ${e}`)}
//         });
// var XML
// XML=response.responseXML;
// console.log(XML);
// // return $("#ArticleTitle", XML);

// function get_bibtex(pmid){
//     var efetch = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id='+ pmid +'&rettype=abstract';
//     var res
//     var XML
//     res = $.ajax({
//         type: 'GET',
//         url: efetch,
//         cache: false
//         })
//     XML=res.responseXML
//     console.log(XML)
//     return $("#ArticleTitle", XML)
// };


// console.log(pmid)
// get_bibtex(pmid)
// function callback(responseText){
//     console.log("callback")
// }
// function httpGet(theUrl,callback){
//     let xmlHttp = new XMLHttpRequest();
//     let readyStateChange = function(){
//         console.log(xmlHttp.readyState);
//         if (xmlHttp.readyState == 4) {
//                     callback(xmlHttp.responseXML);
//         };
//     };
//     xmlHttp.onreadystatechange = readyStateChange;
//     xmlHttp.open( "POST", theUrl, true); // false for synchronous request
//     xmlHttp.send( null );
//     return xmlHttp;
// }

// var res
// res = httpGet(efetch,callback)
// console.log(res)

                // if (bibs[pmid]["doi"]!=""){
                //     $("a[id="+pmid+"]")[0].href="https://sci-hub.tw/"+bibs[pmid]["doi"];
                //     $("a[id="+pmid+"]")[0].innerText="Full Text(PDF)";
                //     $("a[id="+pmid+"]")[0].style.color="#20558a";
                // } else {
                //     $("a[id="+pmid+"]")[0].innerText="Full Text(Not Found)";
                //     $("a[id="+pmid+"]")[0].style.color="grey";
                // }
                                // bibs = core_analyse_imfq(bibs)
                // if (bibs[pmid]["doi"]!=""){
                //     $("a[id="+pmid+"]")[0].href="https://sci-hub.tw/"+bibs[pmid]["doi"];
                //     $("a[id="+pmid+"]")[0].innerText="Full Text(PDF)";
                //     $("a[id="+pmid+"]")[0].style.color="#20558a";
                // } else {
                //     $("a[id="+pmid+"]")[0].innerText="Full Text(Not Found)";
                //     $("a[id="+pmid+"]")[0].style.color="grey";
                // }
                
    //     html += "<dd><a target='_blank' href='"+"https://sci-hub.tw/"+bib["doi"]+"'>Full Text(PDF)</a></dd>";
    // } else {
    //     html += "<dd style='color:grey'>Full Text(Not Found)</dd>"
    // }