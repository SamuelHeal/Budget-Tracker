let database;
let currentBudget;

const request = indexedDB.open('budgetDB', currentBudget || 21);

request.onupgradeneeded = function (event) {
    console.log('Upgrade needed in IndexDB');
  
    const { oldBudget } = event;
    const newBudget = event.newVersion || database.version;
  
    console.log(`Database updated from version ${oldBudget} to ${newBudget}`);
  
    database = event.target.result;
  
    if (database.objectStoreNames.length === 0) {
        database.createObjectStore('budgetStorage', { autoIncrement: true });
    }
  };

request.onerror = function (event) {
  console.log(`Error Alert: ${event.target.errorCode}`);
};

function checkDatabase() {
    console.log('check database invoked');
  
    let transaction = database.transaction(['budgetStorage'], 'readwrite');
    const store = transaction.objectStore('budgetStorage');
    const getAll = store.getAll();

     
     getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
          fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json',
            },
          })
            .then((response) => response.json())
            .then((res) => {
              if (res.length !== 0) {
                transaction = database.transaction(['budgetStorage'], 'readwrite');
                const currentStore = transaction.objectStore('budgetStorage');
                currentStore.clear();
                console.log('Clearing the store');
              }
            });
        }
      };
}

request.onsuccess = function (event) {
  console.log('Success');
  database = event.target.result;

  if (navigator.onLine) {
    console.log('Backend online');
    checkDatabase();
  }
};

const saveRecord = (record) => {
    console.log('Save record invoked');
    const transaction = database.transaction(['budgetStorage'], 'readwrite');
    const store = transaction.objectStore('budgetStorage');
    store.add(record);
  };

  window.addEventListener('online', checkDatabase);