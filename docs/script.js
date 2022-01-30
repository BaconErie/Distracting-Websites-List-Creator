let chooseBlocker = document.getElementById("chooseBlocker");
let chooseOptions = document.getElementById("chooseOptions");
let generatingList = document.getElementById("generatingList");
let finish = document.getElementById("finish");
let downloadList = document.getElementById("download");
let noDownloadList = document.getElementById("noDownload");

let chooseOptionsForm = document.getElementById("chooseOptionsForm");
let gamesOption = document.getElementById("games");
let entertainmentOption = document.getElementById("entertainment");
let socialOption = document.getElementById("social");

let copyListButton = document.getElementById("copyList");
let downloadListButton = document.getElementById("downloadList");

let blocker;
let options = [];
let listGenerated = false;
let finalList = '';

const BLOCKER_PARAMETERS = {
    "coldTurkey": {
        "entrySeperator": "\n",
        "accept": ["wildcard", "domains", "url"],
        "httpAddition": false,
        "download": true
    },

    "leechBlock": {
        "entrySeperator": "\n",
        "accept": ["wildcard", "domains", "url"],
        "httpAddition": false,
        "download": false
    },

    "stayFocusd": {
        "entrySeperator": "\n",
        "accept": ["wildcard", "domains", "url"],
        "httpAddition": false,
        "download": false
    },

    "distractMeNot": {
        "entrySeperator": "\n",
        "accept": ["wildcard", "domains", "url"],
        "httpAddition": true,
        "download": false
    }
};

/*-------------
BUTTON HANDLERS
-------------*/

function blockerChosen(event){
    //Set the blocker
    blocker = event.target.id;
    //Continue to next step
    chooseBlocker.style.display = "none";
    chooseOptions.style.display = "block";
}

function optionsChosen(event){
    event.preventDefault();
    
    checkedOption = false;

    if(gamesOption.checked){
        options.push("games");
        checkedOption = true;
    }
    if(entertainmentOption.checked){
        options.push("entertainment");
        checkedOption = true;
    }
    if(socialOption.checked){
        options.push("social");
        checkedOption = true;
    }

    if(!checkedOption){
        alert("You haven't checked any option!");
        return;
    }

    //Go to next step
    chooseOptions.style.display = "none";
    generatingList.style.display = "flex";
    
    generateList();
}

async function copyList(){
    if(!listGenerated){
        return;
    }

    await navigator.clipboard.writeText(finalList);
}

function downloadListHandler(){
    download("myList.txt", finalList)
}

/*--------------
HELPER FUNCTIONS
--------------*/

async function generateList(){
    let listRaw = [];
    let list = '';
    let x;

    for(let i = 0; i < options.length; i++){
        switch(options[i]){
            case "games":
                x = await getBlockerAcceptedLists("games", blocker)
                listRaw = listRaw.concat(x);
                break;

            case "entertainment":
                x = await getBlockerAcceptedLists("entertainment", blocker)
                listRaw = listRaw.concat(x);
                break;
            
            case "social":
                x = await getBlockerAcceptedLists("social", blocker)
                listRaw = listRaw.concat(x);
                break;
        }
    }

    list = filterList(listRaw, blocker);
    finalList = list;
    listGenerated = true;

    generatingList.style.display = "none";
    finish.style.display = "flex";

    if(BLOCKER_PARAMETERS[blocker]["download"]){
        //Allow downloads
        downloadList.style.display = "block";
    }else{
        //Do not allow downloads, only copying
        noDownloadList.style.display = "block";
    }
}

async function getBlockerAcceptedLists(category, blocker){
    let list = [];
    for(let i = 0; i < BLOCKER_PARAMETERS[blocker]["accept"].length; i++){
        type = BLOCKER_PARAMETERS[blocker]["accept"][i];
        let listResponse = await getList(category, type)
        list = list.concat(listResponse);
    }

    return list;
}

function filterList(listRaw, blocker){

    let filteredList = [];
    if(!BLOCKER_PARAMETERS[blocker]["httpAddition"]){
        //Remove all http or https references from entries
        for(let i = 0; i < listRaw.length; i++){
            let removedHttp = listRaw[i];
            removedHttp = removedHttp.replace("https://", "");
            removedHttp = removedHttp.replace("http://", "")

            filteredList = filteredList.concat(removedHttp);
        }
    }else{
        filteredList = listRaw;
    }

    filteredList = filteredList.filter(word => word.length != 0); //Remove blank entries
    filteredList = filteredList.filter(word => word != "404: Not Found"); //Remove 404 errors
    filteredList.sort()

    return filteredList.join(BLOCKER_PARAMETERS[blocker]["entrySeperator"])
}

async function getList(category, type){
    let response = await fetch(`https://raw.githubusercontent.com/BaconErie/Distracting-Websites/main/lists/${category}/${category}-${type}.txt`);
    let text = await response.text();

    return text.split(/\r\n|\r|\n/g)
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


/*-----------------------
EVENT HANDLER CONNECTIONS
-----------------------*/

chooseOptionsForm.addEventListener("submit", optionsChosen);
copyListButton.addEventListener("click", copyList);
downloadListButton.addEventListener("click", downloadListHandler);


//Add handlers to every blocker button
//This is run when page is loaded

//Get all blocker buttons
const blockerButtons = document.getElementsByClassName("blockerButton");

//Loop through all buttons, add event listener
for(let i = 0; i < blockerButtons.length; i++){
    blockerButtons[i].addEventListener("click", blockerChosen);
}
