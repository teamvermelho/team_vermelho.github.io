let storage = window.localStorage;

let database = [];

for (let i = 0; i < 50; i++){
    let rand = Math.random();
    let randomActive = false;
    if(rand < 0.5){
        randomActive = false;
    }
    if(rand > 0.5){
        randomActive = true;
    }
    database.push({name: "Project Nº "+ i+(Math.round(Math.random()*100000)), active: randomActive, versions: []})
}
for(let i = 0; i < 8; i++){
    for (project of database){
        let rand = Math.random();
        let randomActive = false;
        if(rand < 0.5){
            randomActive = false;
        }
        if(rand > 0.5){
            randomActive = true;
        }
        let version = {
                        number: Math.round(Math.random()*100000),
                        date: new Date(Date.now()-(Math.round(Math.random()*100000000000))),
                        desc: "Dummy version description",
                        gmud: Math.round(Math.random()*10000),
                        clone: "V: " + Math.round(Math.random()*100000),
                        functions: [],
                        active: randomActive
                        }
        project.versions.push(version);
    }
}

let addProject = false;
let activeFilter = false;
let searching = false;
let projectOpen = false;
let projectEdit = false;
let versionEdit = false;
let addVersion = false;
let projectName = null;
let projectObj = null;
let versionObj = null;
let lastProjectName = null;
let versionsObj = null;
let searchData = null;
let page = 0;
let totalPages = (database.length/10)-1;

let sorters = { byName : false, 
                byActive : false };

let databaseAux = [];
let databaseVersions = [];

if (JSON.parse(storage.getItem('projectManager')) !== null){
    database = JSON.parse(storage.getItem('projectManager'));
}

function load(){
    tableHeaderButtons();
    searchInput();
    pageControl();
    populateTable(false, database);
}

function searchInput(){
    let searchBar = document.getElementById("search-input");
    searchBar.addEventListener("input", function(){
        databaseAux = [];
        for (let row of searchData){
            if(!projectOpen){
                if(row.name.includes(searchBar.value)){
                    databaseAux.push(row);
                }
            }
            if(projectOpen){
                if(row.number.toString().includes(searchBar.value)){
                    databaseAux.push(row);
                }
            }
        }
        if(searchBar.value !== ""){
            searching = true;
        }else{
            searching = false;
        }
        page = 0;
        populateTable(activeFilter, databaseAux);
    })
}

function pageControl(){
    let backButton = document.createElement("p");
    let fowardButton = document.createElement("p");
    let showPage = document.createElement("p");
    let pageControlDiv = document.createElement("div");

    backButton.id = "back-button";
    fowardButton.id = "foward-button";
    showPage.id = "show-page";
    pageControlDiv.id = "page-div";

    backButton.innerHTML = "<";
    fowardButton.innerHTML = ">";
    showPage.innerHTML = page+1;

    pageControlDiv.className = "page-div";
    showPage.className = "page";
    backButton.className = "page-button";
    fowardButton.className = "page-button";

    backButton.addEventListener("click", function(){
        if(page > 0){
            page--;
            showPage.innerHTML = page+1;
            populateTable(activeFilter, database);
        }
    })
    fowardButton.addEventListener("click", function(){
        if(page < totalPages){
            page++;
            showPage.innerHTML = page+1;
            populateTable(activeFilter, database);
        }
    })

    document.getElementById("projects_list").appendChild(pageControlDiv);
    pageControlDiv.appendChild(backButton);
    pageControlDiv.appendChild(showPage);
    pageControlDiv.appendChild(fowardButton);
    
}

function populateTable(activeFilter, data){
    let childs = document.getElementById("table_list");
    
    while (childs !== null && childs.childNodes.length > 0){
        childs.removeChild(childs.childNodes[0]);
    }

    document.getElementById("show-page").innerHTML = page+1;

    createTable();

    // PROJECT
    if (!projectOpen){
        if (activeFilter || searching){
            data = databaseAux;
            totalPages = (data.length/10)-1;
        }else{
            searchData = data;
        }

        for (let i = 0+page*10; i < 10+page*10; i++){
            let dot = document.createElement("span");
            if(data[i].active){
                dot.className = "green-dot";
                rowProject(data[i], dot);
            }
            if(!data[i].active && !activeFilter){
                dot.className = "red-dot";
                rowProject(data[i], dot);
            }
        }

        function rowProject(row, dot){
            createRow(row.name);

            let name_column = document.createElement("td");
            name_column.innerHTML = row.name;
            name_column.addEventListener('click', openObj)

            let active_column = document.createElement("td");

            active_column.appendChild(dot);

            document.getElementById(row.name).appendChild(name_column);
            document.getElementById(row.name).appendChild(active_column);

        }
    }
    // VERSIONS
    if (projectOpen){
        if (searching){
            data = databaseAux;
        }else{
            searchData = versionsObj;
            data = versionsObj;
        }

        totalPages = (versionsObj.length/10)-1;

        for (let i = 0+page*10; i < 10+page*10; i++){
            let dot = document.createElement("span");
            if(data[i].active){
                dot.className = "green-dot";
                rowVersion(data[i], dot);
            }
            if(!data[i].active && !activeFilter){
                dot.className = "red-dot";
                rowVersion(data[i], dot);
            }
        }

        function rowVersion(row, dot){
            createRow(row.number);

            let newRow = document.getElementById(row.number);

            let number_column = document.createElement("td");
            let date_column = document.createElement("td");
            let gmud_column = document.createElement("td");
            let function_column = document.createElement("td");
            let active_column = document.createElement("td");

            number_column.innerHTML = row.number;
            date_column.innerHTML = row.date;
            gmud_column.innerHTML = row.gmud;
            function_column.innerHTML = row.functions.length;

            active_column.appendChild(dot);
            number_column.addEventListener('click', openObj);

            newRow.appendChild(number_column);
            newRow.appendChild(date_column);
            newRow.appendChild(gmud_column);
            newRow.appendChild(function_column);
            newRow.appendChild(active_column);

        }
    }

}

function createTable(){

    // Criando a tabela
    let table = document.createElement('table');
    table.id = "projects_table";
    document.getElementById("table_list").appendChild(table);

    // Criando a linha dentro da tabela
    createRow("projects_table_row");

    // Craindo as colunas com os headers da tabela (PROJETO)
    if(!projectOpen){
        let table_header_name = document.createElement("th");
        table_header_name.id = "header_name";
        table_header_name.innerHTML = "Nome";
        table_header_name.addEventListener('click', arrangeTable)
        document.getElementById("projects_table_row").appendChild(table_header_name);

        let table_header_active = document.createElement("th");
        table_header_active.id = "header_active";
        table_header_active.innerHTML = "Ativo";
        table_header_active.style.width = "10%";
        table_header_active.style.textAlign = "center";
        table_header_active.addEventListener('click', arrangeTable);
        document.getElementById("projects_table_row").appendChild(table_header_active);
    }
    if(projectOpen){
        // let table_headers = ["Versão", "Data", "GMUD", "Funcionalidades", "Ativo"];
        let projectTableRow = document.getElementById("projects_table_row");

        let version_header = document.createElement("th");
        let date_header = document.createElement("th");
        let gmud_header = document.createElement("th");
        let functions_header = document.createElement("th");
        let active_header = document.createElement("th");

        version_header.id = "version-header";
        date_header.id = "date-header";
        gmud_header.id = "gmud-header";
        functions_header.id = "functions-header";
        active_header.id = "active-header";

        version_header.innerHTML = "Versão";
        date_header.innerHTML = "Data";
        gmud_header.innerHTML = "GMUD";
        functions_header.innerHTML = "Funcionalidades";
        active_header.innerHTML = "Ativo";

        projectTableRow.appendChild(version_header);
        projectTableRow.appendChild(date_header);
        projectTableRow.appendChild(gmud_header);
        projectTableRow.appendChild(functions_header);
        projectTableRow.appendChild(active_header);
    }
}

function createRow(id){
    // Criando a linha dentro da tabela
    let table_row = document.createElement("tr");
    table_row.id = id;
    document.getElementById("projects_table").appendChild(table_row);
}

function arrangeTable(){
    if (database !== []){
        let header = this.id;
        switch(this.id){
            case "header_name": 
                if (sorters.byName){
                    database.sort(function(a,b) {return ((a.name < b.name) ? -1 : ((a.name > b.name) ? 1 : 0))});
                    sorters.byName = false;
                    populateTable(false, database);
                    document.getElementById(header).innerHTML = "Nome &and;";
                } else {
                    database.sort(function(a,b) {return ((a.name > b.name) ? -1 : ((a.name < b.name) ? 1 : 0))});
                    sorters.byName = true;
                    populateTable(false, database);
                    document.getElementById(header).innerHTML = "Nome &or;";
                }
                break;
            case "header_active":
                if (sorters.byActive){
                    database.sort(function(a, b){return a.active-b.active});
                    sorters.byActive = false;
                    populateTable(false, database);
                    document.getElementById(header).innerHTML = "Ativo &and;";
                } else {
                    database.sort(function(a, b){return b.active-a.active});
                    sorters.byActive = true;
                    populateTable(false, database);
                    document.getElementById(header).innerHTML = "Ativo &or;";
                }
                break;
            case "slider_input":
                if(this.checked){
                    databaseAux = [];
                    for (let row of database){
                        if(row.active){
                            databaseAux.push(row);
                        }
                    }
                    activeFilter = true;
                    page = 0;
                    populateTable(activeFilter, databaseAux);
                }else{
                    page = 0;
                    activeFilter = false;
                    populateTable(false, database);
                }
        }
    }
}

function tableHeaderButtons(){

    let tableHeaderDiv = document.createElement("div");
    tableHeaderDiv.id = "table_header_buttons";
    tableHeaderDiv.className = "table-header-buttons-div";

    // Cadastro
    let addDiv = document.createElement("div");
    addDiv.id = "add_div";
    addDiv.className = "table-header-div";

    let addText = document.createElement("p");
    addText.innerHTML = "Cadastrar";

    let addButton = document.createElement("button");
    addButton.innerHTML = "+";
    addButton.className = "add-button";
    addButton.addEventListener("click", function(){
        addProject = true;
        projectEdit = true;
        openObj();
    })

    // Slide
    let sliderDiv = document.createElement("div");
    sliderDiv.id = "slider_div";
    sliderDiv.className = "table-header-div";

    let slideText = document.createElement("p");
    slideText.innerHTML = "Mostar apenas ativos";

    let label = document.createElement("label");
    label.id = "slider_label";
    label.className = "switch";

    let input = document.createElement("input");
    input.id = "slider_input";
    input.setAttribute("type", "checkbox");
    input.addEventListener('click', arrangeTable);
    if(activeFilter){
        input.checked = true;
    }else{
        input.checked = false;
    }

    let span = document.createElement("span");
    span.id = "slider_span";
    span.className = "slider";

    document.getElementById("table_list_header").appendChild(tableHeaderDiv);

    // Adicionando o Slider
    document.getElementById("table_header_buttons").appendChild(sliderDiv);
    sliderDiv.appendChild(slideText);
    sliderDiv.appendChild(label);
    label.appendChild(input);
    label.appendChild(span);

    // Adicionando o Cadastro
    document.getElementById("table_header_buttons").appendChild(addDiv);
    addDiv.appendChild(addText);
    addDiv.appendChild(addButton);
}

//------------------------ MODAL ------------------------

function createProjetc(){
    let modal = document.getElementById("modal");
    let span = document.getElementById("close");
    let modal_content = document.getElementById("project-content");
    let modal_header =  document.getElementById("modal_header");
    modal_header.innerHTML = "Novo Projeto"
}


function openObj(){
    let modal = document.getElementById("modal");
    let span = document.getElementById("close");
    let modal_content = document.getElementById("project-content");
    let modal_header =  document.getElementById("modal_header");
    
    while (modal_content !== null && modal_content.childNodes.length > 0){
        modal_content.removeChild(modal_content.childNodes[0]);
    }

    if(addProject){
        modal_header.innerHTML = "Novo Projeto"
    }

    if (projectOpen && !versionEdit){
        versionNumber = this.innerHTML;
        modal_header.innerHTML = "Versão: " + versionNumber;

        modal_content.style.flexDirection = "unset";
        let editButton = document.createElement("button");
        editButton.innerHTML = "Editar";
        editButton.className = "modal-button";
        editButton.addEventListener("click", function(){
            versionEdit = true;
            openObj();
        });

        let openButton = document.createElement("button");
        openButton.innerHTML = "Abrir";
        openButton.className = "modal-button";
        // openButton.addEventListener("click", function(){
        //     modal.style.display = "none";
        //     projectOpen = true;
        //     projectObj = database.find(x => x.name === versionNumber);
        //     versionsObj = projectObj.versions;
        //     populateTable(false, versionsObj);
        // });

        modal_content.appendChild(editButton);
        modal_content.appendChild(openButton);

        modal.style.display = "block";
    }

    if (versionEdit){

        if (!addVersion){
            console.log(versionsObj);
            versionObj = versionsObj.find(x => x.number.toString() === versionNumber.toString());
            console.log(versionObj);
            // nameInput.value = versionObj.number;
        }else{
            versionObj = {
                number: 0,
                date: new Date(Date.now()),
                desc: "",
                gmud: 0,
                clone: 0,
                functions: [],
                active: false
                }
        }

        modal.style.display = "block";
        modal_header.innerHTML = "Versão: " + versionNumber;

        // DOM
        let version_num_div = document.createElement("div");
        let version_num_label = document.createElement("label");
        let version_num = document.createElement("input");

        let version_date_div = document.createElement("div");
        let version_date_label = document.createElement("label");
        let version_date= document.createElement("input");

        let version_desc_div = document.createElement("div");
        let version_desc_label = document.createElement("label");
        let version_desc = document.createElement("input");

        let version_gmud_div = document.createElement("div");
        let version_gmud_label = document.createElement("label");
        let version_gmud = document.createElement("input");

        //labels
        version_num_label.innerHTML = "Número da Versão: ";
        version_date_label.innerHTML = "Data: ";
        version_desc_label.innerHTML = "Descrição: ";
        version_gmud_label.innerHTML = "Número GMUD: ";

        //input values
        version_num.value = versionObj.number;
        version_date.value = versionObj.date;
        version_desc.value = versionObj.desc;
        version_gmud.value = versionObj.gmud;

        let version_div = document.createElement("div");
        version_div.style.display = "flex";
        version_div.style.flexDirection = "column";

        modal_content.appendChild(version_div);

        version_div.appendChild(version_num_div);
        version_div.appendChild(version_date_div);
        version_div.appendChild(version_desc_div);
        version_div.appendChild(version_gmud_div);

        version_num_div.appendChild(version_num_label);
        version_num_div.appendChild(version_num);

        version_date_div.appendChild(version_date_label);
        version_date_div.appendChild(version_date);

        version_desc_div.appendChild(version_desc_label);
        version_desc_div.appendChild(version_desc);

        version_gmud_div.appendChild(version_gmud_label);
        version_gmud_div.appendChild(version_gmud);

        // DOM

        // Slide
        let editInputDiv = document.createElement("div");
        editInputDiv.className = "edit-div";

        let label = document.createElement("label");
        label.id = "slider_label";
        label.className = "switch";

        let input = document.createElement("input");
        input.id = "slider_input";
        input.setAttribute("type", "checkbox");
        if(projectObj.active){
            input.checked = true;
        }else{
            input.checked = false;
        }

        let span = document.createElement("span");
        span.id = "slider_span";
        span.className = "slider";

        modal_content.appendChild(editInputDiv);
        editInputDiv.appendChild(label);
        label.appendChild(input);
        label.appendChild(span);
        // Slide

    }

    if (!projectOpen && !projectEdit){

        projectName = this.innerHTML;
        modal_header.innerHTML = projectName;

        modal_content.style.flexDirection = "unset";
        let editButton = document.createElement("button");
        editButton.innerHTML = "Editar";
        editButton.className = "modal-button";
        editButton.addEventListener("click", function(){
            projectEdit = true;
            openObj();
        });

        let openButton = document.createElement("button");
        openButton.innerHTML = "Abrir";
        openButton.className = "modal-button";
        openButton.addEventListener("click", function(){
            modal.style.display = "none";
            projectOpen = true;
            projectObj = database.find(x => x.name === projectName);
            versionsObj = projectObj.versions;
            populateTable(false, versionsObj);
        });

        modal_content.appendChild(editButton);
        modal_content.appendChild(openButton);

        modal.style.display = "block";
    }
    
    if (projectEdit){
        modal_content.style.flexDirection = "column";
        let editButtonsDiv = document.createElement("div");
        editButtonsDiv.className = "edit-div";

        let editInputDiv = document.createElement("div");
        editInputDiv.className = "edit-div";

        let nameInput = document.createElement("input");
        nameInput.setAttribute("type", "text");

        if (!addProject){
            projectObj = database.find(x => x.name === projectName);
            nameInput.value = projectObj.name;
        }else{
            projectObj = {name: "", active: false};
        }
        nameInput.className = "modal-text-input";

        let saveButton = document.createElement("button");
        saveButton.innerHTML = "Salvar";
        saveButton.className = "modal-button";
        saveButton.addEventListener("click", function(){
            if (!addProject){
                var index = database.map(function(item) { return item.name; }).indexOf(projectName);
                database.splice(index, 1);
            }
            database.push({name: nameInput.value, active: input.checked})
            modal.style.display = "none";
            populateTable(activeFilter, database);
            projectName = null;
            projectEdit = false;
            addProject = false;

        })

        
        let deleteButton = document.createElement("button");
        deleteButton.innerHTML = "Deletar";
        deleteButton.className = "modal-button-delete";
        deleteButton.addEventListener("click", function(){
            var index = database.map(function(item) { return item.name; }).indexOf(projectName);
            database.splice(index, 1);
            modal.style.display = "none";
            populateTable(activeFilter, database);
            projectName = null;
            projectEdit = false;

        })

        // Slide
        let label = document.createElement("label");
        label.id = "slider_label";
        label.className = "switch";

        let input = document.createElement("input");
        input.id = "slider_input";
        input.setAttribute("type", "checkbox");
        if(projectObj.active){
            input.checked = true;
        }else{
            input.checked = false;
        }

        let span = document.createElement("span");
        span.id = "slider_span";
        span.className = "slider";

        modal_content.appendChild(editInputDiv);
        editInputDiv.appendChild(label);
        label.appendChild(input);
        label.appendChild(span);

        editInputDiv.appendChild(nameInput);
        modal_content.appendChild(editButtonsDiv);
        editButtonsDiv.appendChild(saveButton);
        if (!addProject){
            editButtonsDiv.appendChild(deleteButton);
        }

        modal.style.display = "block";

    }

    span.onclick = function() {
        modal.style.display = "none";
        versionEdit = false;
        projectEdit = false;
        addProject = false;
        projectName = null;
        versionNumber = null;
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            versionEdit = false;
            projectEdit = false;
            addProject = false;
            projectName = null;
            versionNumber = null;
        }
    }
}