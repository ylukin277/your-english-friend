var libraryVideos = [
    {
        'page-header': "Library (Videos)",
        'not-found': "Videos are not found."
    },
    {
        'page-header': "Библиотека (Видео)",
        'not-found': "Видео не найдены."
    }
];

function updateContent(language,divContent){
    updateLastActivity();
    divContent.innerHTML = '';
    if(getParam('all') != -1) {
        contentAll(language,divContent);
    } else if(getParam('liked') != -1) {
        contentLiked(language,divContent);
    } else if(getParam('recommended') != -1) {
        contentRecommended(language,divContent);
    } else if(getParam('search') != -1) {
        if($.cookie('searchVideos') == null || $.cookie('searchVideos') == 'null' || $.cookie('searchVideos') == undefined){
            clearSearchParameters();
        }
        contentSearch(language,divContent);
    } else if(getParam('id') != -1) {
        contentId(language,divContent);
    } else {
        defaultTab(language,divContent);
    }
}

function contentAll(language,divContent) {
    contentHeader(language,divContent);
    contentTabs(language,divContent,1);
    $.ajax({
        type: "POST",
        url: "../../ajax/library/videos/getVideosList.php",
        data: "language=" + language + "&page=" + getParam('page='),
        success: function (data) {
            divContent.innerHTML += contentList(language,JSON.parse(data),'videos?all&');
        }
    });
}

function contentLiked(language,divContent) {
    if (isAuthorized()) {
        contentHeader(language, divContent);
        contentTabs(language, divContent, 2);
        $.ajax({
            type: "POST",
            url: "../../ajax/library/videos/getVideosLikedList.php",
            data: "language=" + language + "&user=" + $.cookie('user') + "&page=" + getParam('page='),
            success: function (data) {
                divContent.innerHTML += contentList(language, JSON.parse(data), 'videos?liked&');
            }
        });
    } else {
        defaultTab(language, divContent);
    }
}

function contentRecommended(language,divContent) {
    if(isAuthorized()) {
        contentHeader(language,divContent);
        contentTabs(language,divContent,3);
        $.ajax({
            type: "POST",
            url: "../../ajax/library/videos/getVideosRecommendedList.php",
            data: "language=" + language + "&user=" + $.cookie('user') + "&page=" + getParam('page='),
            success: function (data) {
                if(data == '') {
                    var items = [];
                } else {
                    var items = JSON.parse(data);
                }
                divContent.innerHTML += contentList(language,items,'videos?recommended&');
            }
        });
    } else {
        defaultTab(language,divContent);
    }
}

function contentSearch(language,divContent) {
    contentHeader(language,divContent);
    contentTabs(language,divContent,4);
    var searchParameters = JSON.parse($.cookie('searchVideos'));
    divContent.innerHTML += '<div id="search-panel" style="margin: 10px 0"></div>';
    contentSearchPanel(language,searchParameters,document.getElementById('search-panel'));
    $.ajax({
        type: "POST",
        url: "../../ajax/library/videos/getVideosSearchList.php",
        data: "language=" + language + "&user=" + $.cookie('user') + "&page=" + getParam('page=') +
        "&title=" + searchParameters["title"] + "&difficulty=" + searchParameters["difficulty"] + "&category=" + searchParameters["category"],
        success: function (data) {
            divContent.innerHTML += contentList(language,JSON.parse(data),'videos?search&');
        }
    });
    if(document.getElementById('search-panel').innerHTML == ''){
        contentSearchPanel(language,searchParameters,document.getElementById('search-panel'));
    }
}

function contentSearchPanel(language,searchParameters,divPanel) {
    $.ajax({
        type: "POST",
        url: "../../ajax/library/videos/getVideosCategoriesList.php",
        data: "language=" + language,
        success: function (data) {
            var categories = JSON.parse(data);
            var panel = '';
            panel += '<input type="text" id="title" class="search-input" placeholder="'+titles[language]['search-title']+'" value="'+searchParameters['title']+'">';
            panel += '<select id="difficulty" class="search-select">';
            for(var i=0; i<=3; i++){
                if(searchParameters['difficulty']==i){
                    panel += '<option selected value='+i+'>'
                } else {
                    panel += '<option value='+i+'>'
                }
                for(var j=0; j<i; j++){
                    panel += '&#9733;';
                }
                panel += '</option>'
            }
            panel += '</select>';
            panel += '<select id="category" class="search-select">';
            if(searchParameters['category']==0) {
                panel += '<option selected value=0></option>';
            } else {
                panel += '<option value=0></option>';
            }
            for(var i=0; i<categories.length; i++){
                if(searchParameters['category']==categories[i][0]){
                    panel += '<option selected value='+categories[i][0]+'>'
                } else {
                    panel += '<option value='+categories[i][0]+'>'
                }
                panel += categories[i][1];
                panel += '</option>'
            }
            panel += '</select>';
            panel += '<input type="button" class="search-button" value="'+titles[language]['search-search']+' &#128269;" ' +
            ' onclick="setSearchParameters(document.getElementById(\'title\').value,document.getElementById(\'difficulty\').value,document.getElementById(\'category\').value); ' +
            'updateContent($.cookie(\'language\'),document.getElementById(\'div-content\'));">';
            panel += '<input type="button" class="search-button-reset" value="'+titles[language]['search-reset']+'" ' +
            ' onclick="clearSearchParameters(); updateContent($.cookie(\'language\'),document.getElementById(\'div-content\'));">';
            divPanel.innerHTML = panel;
        }
    });
}

function contentId(language,divContent) {
    contentHeader(language,divContent);
    contentTabs(language,divContent,0);
    if(isAuthorized()){
        var user = $.cookie('user');
    } else {
        var user = 0;
    }
    if(language == 0) {
        var langTrns = 1;
    } else {
        var langTrns = language;
    }
    $.ajax({
        type: "POST",
        url: "../../ajax/library/videos/getVideo.php",
        data: "language=" + langTrns + "&id=" + getParam('id=') + "&user=" + user,
        success: function (data) {
            var item = JSON.parse(data);
            if(item[0] == null) {
                defaultTab(language,divContent);
            } else {
                divContent.innerHTML += contentItem(language, JSON.parse(data));
            }
        }
    });
}

function defaultTab(language,divContent) {
    document.location.hash = '#videos?all&page=1';
    updateContent(language,divContent);
}

function contentHeader(language,divContent) {
    divContent.innerHTML += '<p class="page-header">'+libraryVideos[language]["page-header"]+'</p>';
}

function contentTabs(language,divContent,activeTab) {
    if(activeTab == 1){
        divContent.innerHTML += '<input type="button" class="submenu-button-active" value="'+titles[language]["button-all"]+'">';
    } else {
        divContent.innerHTML += '<input onclick="document.location.hash = \'#videos?all&page=1\'; updateContent($.cookie(\'language\'),document.getElementById(\'div-content\'));" type="button" class="submenu-button" value="'+titles[language]["button-all"]+'">';
    }
    if(isAuthorized()){
        if(activeTab == 2) {
            divContent.innerHTML += '<input type="button" class="submenu-button-active" value="' + titles[language]["button-liked"] + '">';
        } else {
            divContent.innerHTML += '<input onclick="document.location.hash = \'#videos?liked&page=1\'; updateContent($.cookie(\'language\'),document.getElementById(\'div-content\'));" type="button" class="submenu-button" value="' + titles[language]["button-liked"] + '">';
        }
        if(activeTab == 3) {
            divContent.innerHTML += '<input type="button" class="submenu-button-active" value="' + titles[language]["button-recommended"] + '">';
        } else {
            divContent.innerHTML += '<input onclick="document.location.hash = \'#videos?recommended&page=1\'; updateContent($.cookie(\'language\'),document.getElementById(\'div-content\'));" type="button" class="submenu-button" value="' + titles[language]["button-recommended"] + '">';
        }
    }
    if(activeTab == 4){
        divContent.innerHTML += '<input type="button" class="submenu-button-active" value="'+titles[language]["button-search"]+'"></br>';
    } else {
        divContent.innerHTML += '<input onclick="document.location.hash = \'#videos?search&page=1\'; updateContent($.cookie(\'language\'),document.getElementById(\'div-content\'));" type="button" class="submenu-button" value="'+titles[language]["button-search"]+'"></br>';
    }
}

function contentList(language,items,link) {
    var cont = '';
    if(items.length>1){
        cont += '<table style="width: 100%;">';
        for (var i=0; i<items.length-1; i++) {
            cont += '<tr>' +
            '<td style="width: 50px"><img class="list-image" src="http://' + location.hostname + items[i][4] + '"></td>' +
            '<td style="width: 300px"><p class="list-text" onclick="document.location.hash = \'#videos?id=' + items[i][0] + '\'; updateContent($.cookie(\'language\'),document.getElementById(\'div-content\'));">' + items[i][1] + '</p></td>' +
            '<td style="width: 70px" align="center"><p class="list-diff">';
            for(var j=0; j<items[i][2]; j++){
                cont += '&#9733;'
            }
            cont += '</p></td>' +
            '<td><p class="list-category">' + items[i][3] + '</p></td>' +
            '</tr>';
        }
        cont += '</table>';
        cont += getPages(items[items.length-1],getParam('page='),link);
    } else {
        cont += '<p class="not-found-text">'+libraryVideos[language]['not-found']+'</p>'
    }
    return cont;
}

function contentItem(language,item) {
    var cont = '';
    cont += '<table style="width:100%;">' +
    '<tr><td colspan="2" align="center">' + item[7] + '</td></tr>' +
    '<tr><td style="width:50%;"><p class="page-title" align="center">'+item[1]+'</p></td><td style="width:50%;"><p class="page-title" align="center">'+item[3]+'</p></td></tr>';
    var engText = item[2].split('\n');
    var trnsText = item[4].split('\n');
    for(var i=0; i<engText.length; i++) {
        cont += '<tr><td style="width:50%; border-top: 1px dotted #DDDDDD; vertical-align: top"><p class="page-text">'+engText[i]+'</p></td><td style="width:50%; border-top: 1px dotted #DDDDDD; vertical-align: top"><p class="page-text-grey">'+trnsText[i]+'</p></td></tr>';
    }
    cont += '</table>';
    if(isAuthorized()){
        if(item[5] == 0) {
            cont += '<div id="like"><input type="button" class="not-liked" value="'+item[6]+' &#10084;" onclick="like()"></div>';
        } else {
            cont += '<div id="like"><input type="button" class="liked" value="'+item[6]+' &#10084;" onclick="unlike()"></div>';
        }
    }
    return cont;
}

function like(){
    updateLastActivity();
    $.ajax({
        type: "POST",
        url: "../../ajax/library/videos/likeVideo.php",
        data: "id=" + getParam('id') + "&user=" + $.cookie('user'),
        success: function (data) {
            document.getElementById("like").innerHTML = '<input type="button" class="liked" value="'+data+' &#10084;" onclick="unlike()">';
        }
    });
}

function unlike(){
    updateLastActivity();
    $.ajax({
        type: "POST",
        url: "../../ajax/library/videos/unlikeVideo.php",
        data: "id=" + getParam('id') + "&user=" + $.cookie('user'),
        success: function (data) {
            document.getElementById("like").innerHTML = '<input type="button" class="not-liked" value="'+data+' &#10084;" onclick="like()">';
        }
    });
}

function clearSearchParameters(){
    $.cookie('searchVideos',JSON.stringify({'title':'','difficulty':0,'category':0}));
}

function setSearchParameters(title,difficulty,category){
    $.cookie('searchVideos',JSON.stringify({'title':title,'difficulty':difficulty,'category':category}));
}