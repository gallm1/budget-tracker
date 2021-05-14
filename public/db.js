let db;

//reguest new database and version of db1

const request = window.indexedDB.open("budgetTrackDb", 1);

// events

request.onupgradeneeded = (event) => {
    // gives most updated events target result

    const db = event.target.result;

    // references object store, increments version automatically
    const objectStore = db.createObjectStore("BudgetStore", { autoIncrement: true });
};

// transactions to now existing database

request.onsuccess = (event) => {
    // accesses current version
    
    db = event.target.result;
    // if back online
    
    if (navigator.online) {
        checkDatabase();
    }
};

// handle error

request.onerror = (event) => {
    console.log("Houston, we have a problem", event);
};

// Record matching a model

function saveRecord(record) {
    // creating a transaction, readwrite to db
    const transaction = db.transaction(["BudgetStore"], "readwrite");
    // access to object store
    const budgetStore = transaction.objectStore("BudgetStore");
    // saves record
    budgetStore.add(record);
};

function checkDatabase() {
    // open a trans in pending db
    const transaction = db.transaction(["BudgetStore"]);
    // 
    const budgetStore = transaction.objectStore("BudgetStore");
    // gathers all records from store and sets to a var
    const getAll = budgetStore.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })

                .then((response) => response.json())
                .then((res) => {
                    if (res) {
                        const transaction = db.transaction(["BudgetStore"], "readwrite");
                        // clears all items in object store
                        const store = transaction.objectStore("BudgetStore");
                        store.clear();
                    }
                })
        }
    };
}

// lists for app coming back online
window.addEventListener("online", checkDatabase);