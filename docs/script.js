let chooseBlocker = document.getElementById("chooseBlocker");
let chooseOptions = document.getElementById("chooseOptions");
let generatingList = document.getElementById("generatingList");
let finish = document.getElementById("finish");

let chooseOptionsForm = document.getElementById("chooseOptionsForm");
let gamesOption = document.getElementById("games");
let entertainmentOption = document.getElementById("entertainment");
let socialOption = document.getElementById("social");

let copyListButton = document.getElementById("copyList");

let blocker;
let options = [];
let listGenerated = false;
let finalList = '';

const BLOCKER_PARAMETERS = {
    "coldTurkey": {
        "entrySeperator": "\n",
        "accept": ["wildcard", "domains", "url"],
        "httpAddition": false
    },

    "leechBlock": {
        "entrySeperator": "\n",
        "accept": ["wildcard", "domains", "url"],
        "httpAddition": false
    },

    "stayFocusd": {
        "entrySeperator": "\n",
        "accept": ["wildcard", "domains", "url"],
        "httpAddition": false
    },

    "distractMeNot": {
        "entrySeperator": "\n",
        "accept": ["wildcard", "domains", "url"],
        "httpAddition": true
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
    if(gamesOption.checked){
        options.push("games");
    }
    if(entertainmentOption.checked){
        options.push("entertainment");
    }
    if(socialOption.checked){
        options.push("social");
    }

    //Go to next step
    chooseOptions.style.display = "none";
    generatingList.style.display = "block";
    
    generateList();

    event.preventDefault();
}

async function copyList(){
    if(!listGenerated){
        return;
    }

    await navigator.clipboard.writeText(finalList);
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
    finish.style.display = "block";
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

/*-----------------------
EVENT HANDLER CONNECTIONS
-----------------------*/

chooseOptionsForm.addEventListener("submit", optionsChosen);
copyListButton.addEventListener("click", copyList)

//Add handlers to every blocker button
//This is run when page is loaded

//Get all blocker buttons
const blockerButtons = document.getElementsByClassName("blockerButton");

//Loop through all buttons, add event listener
for(let i = 0; i < blockerButtons.length; i++){
    blockerButtons[i].addEventListener("click", blockerChosen);
}

