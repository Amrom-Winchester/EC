//database version signifies how many major changes my database has been through
// indexedDB.open("database name", database version );
let req = indexedDB.open("Notes",2);

// req -> Here this is the request to open the database , so the result of the request will give us the database
// database -> req.result

// it has three important events -> success , upgradeneeded , error

// success -> If the database is able to open / access
req.addEventListener("success",function(){
    console.log(1);
    let db = req.result;
    console.log(db);
})

// upgradedneeded -> All the changes made to the database and the creation of database comes under this event
req.addEventListener("upgradeneeded",function(){
    console.log(2);
    let db = req.result;
    console.log(db);
})

// error -> If you are trying to open or access the database which is no longer available
req.addEventListener("error",function(){
    console.log(3);
})