// variable to hold db connection
let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;

    db.createObjectStore('new_budget_item', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.online) {
        // uploadBudgetItem();
    }
}

request.onerror = function(event) {
    console.log(event.target.errorCode);
}

// This function will be executed if we attempt to submit a new pizza and there's no internet connections
function saveRecord(record) {
    const transaction = db.transaction(['new_budget_item'], 'readwrite');

    // access the object store for 'new_budget_item'
    const budgetObjectStore = transaction.objectStore('new_budget_item');

    // add record to your store with add method
    budgetObjectStore.add(record);
}

function uploadBudgetItem() {
    // open a transaction on your db
    const transaction = db.transaction(['new_budget_item'], 'readwrite');

    // access your object store
    const budgetObjectStore = transaction.objectStore('new_budget_item');

    // get all records from store and set to a variable
    const getAll = budgetObjectStore.getAll();

    // upon succesful .getAll() execution
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    // open transaction
                    const transaction = db.transaction(['new_budget_item'], 'readwrite');

                    // access the new_budget_item object store
                    const budgetObjectStore = transaction.objectStore('new_budget_item');

                    // clear all items you stored
                    budgetObjectStore.clear();

                    alert('Connection detected and budget items have been submitted');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };

};

window.addEventListener('online', uploadBudgetItem);