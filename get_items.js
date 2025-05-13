
const fs = require('fs');
const path = require('path');

// Create a new file to store the items
const ITEMS_URL = 'https://romapi.borf.nl/db/items'
const ITEMS_FILE = path.join(__dirname, 'files', 'items.json');

const fetchItems = async () => {
    try {
        const response = await fetch(ITEMS_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}\n${response.statusText}`);
        }
        const data = await response.json();
        
        // Filter out items with 'CanExchange' set to false
        const filteredItems = data.filter(item => item.CanExchange);

        // Make object indexable by ID
        const indexedItems = {};
        filteredItems.forEach(item => {
            indexedItems[item.Id] = item;
        });

        // Write the indexed items to a file
        fs.writeFileSync(ITEMS_FILE, JSON.stringify(indexedItems, null, 2), 'utf-8');
        console.log(`Fetched and saved ${Object.keys(indexedItems).length} items to ${ITEMS_FILE}`);

    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

fetchItems();