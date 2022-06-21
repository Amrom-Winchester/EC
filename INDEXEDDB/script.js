let openBtn = document.querySelector("#open");

let addBtn = document.querySelector("#add");

let input = document.querySelector("input");

let viewBtn = document.querySelector("#view");
let table = document.querySelector("table");

let db;

let tempData = [
    { cId: 2423534534, note: "this is note 1" },
    { cId: 2426634534, note: "this is note 2" },
    { cId: 2113534534, note: "this is note 3" },
];

addBtn.addEventListener("click",function(){
    if(!db){
        console.log("Database has not been opened yet");
        return;
    }

    let value = input.value;
    input.value = "";

    let tx = db.transaction("CsNotes","readwrite");
    let csNotesObjectStore = tx.objectStore("CsNotes");

    let data = {
        note: value,
        cId: Date.now(),
    };
    csNotesObjectStore.add(data);
});

openBtn.addEventListener("click",function(){
    let req = indexedDB.open("Notes",1);

    req.addEventListener("success",function(){
        db = req.result;
        console.log(db);
        alert("Successfully Opened");
    });

    req.addEventListener("upgradeneeded",function(){
        db = req.result;
        db.createObjectStore("CsNotes", {keyPath:"cId"});
    });

    req.addEventListener("error",function(){
        alert("Error in opening the database")
    });
});

viewBtn.addEventListener("click",function(){

    let isOpen = viewBtn.getAttribute("data-open");

    if(isOpen=="true"){
        viewBtn.setAttribute("data-open","false");
        table.innerHTML = "";
        return;
    }

    viewBtn.setAttribute("data-open","true");
    let tx = db.transaction("CsNotes","readonly");
    let csNotesObjectStore = tx.objectStore("CsNotes");

    let req = csNotesObjectStore.openCursor();

    table.innerHTML = `<thead>
    <tr>
        <th>S. No.</th>
        <th>Note</th>
        <th> Delete </th>
    </tr>
    </thead>
    <tbody>
    </tbody>`;

    let tbody = table.querySelector("tbody");
    let sNo = 1;
    req.addEventListener("success",function(e){
        let cursor = req.result;

        if(cursor){
            let curObj = cursor.value;  // give curObj the object to which the cursor is currently pointing
            let tr = document.createElement("tr");
            tr.innerHTML = `
            <td> ${sNo} </td>
            <td> ${curObj.note} </td>
            <td> <button id = "delete" data-cId="${curObj.cId}"> Delete </button> </td>`;
            tbody.append(tr);  // adds the rows to the table
            sNo++;
            cursor.continue();  // gives another request within this request to point the cursor to the next object

            let deleteBtn = tr.querySelector("#delete");

            deleteBtn.addEventListener("click",function (e){
                let cId = Number(e.currentTarget.getAttribute("data-cId"));
                deleteNote(cId);
                e.currentTarget.parentElement.parentElement.remove();
            })

        }
    })
})

function deleteNote(cId) {
    let tx = db.transaction("CsNotes","readwrite");

    let csNotesObjectStore = tx.objectStore("CsNotes");

    csNotesObjectStore.delete(cId);
}
